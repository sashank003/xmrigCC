/* XMRigCC
 * Copyright 2017-     BenDr0id    <https://github.com/BenDr0id>, <ben@graef.in>
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

#include <cstring>
#include <sstream>
#include <fstream>
#include <memory>
#include "3rdparty/cpp-httplib/httplib.h"

#include "base/io/log/Log.h"

#include "CCServerConfig.h"
#include "Service.h"
#include "Httpd.h"
#include "version.h"

namespace
{
void addResponseHeader(httplib::Response& res)
{
  res.set_header("Access-Control-Allow-Origin", "*");
  res.set_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set_header("WWW-Authenticate", "Basic");
  res.set_header("WWW-Authenticate", "Bearer");
}
}

Httpd::Httpd(const std::shared_ptr<CCServerConfig>& config)
  : m_config(config)
{
}

Httpd::~Httpd()
{
  stop();
}

int Httpd::start()
{
  m_service = std::make_shared<Service>(m_config);
  m_service->start();

#ifdef XMRIG_FEATURE_TLS
  if (m_config->useTLS())
  {
    if (m_config->keyFile().empty() || m_config->certFile().empty())
    {
      LOG_ERR("HTTPS Daemon failed to start. Unable to load Key/Cert.");
      return false;
    }

    m_srv = std::make_shared<httplib::SSLServer>(m_config->certFile().c_str(), m_config->keyFile().c_str());
  }
  else
  {
#endif
    m_srv = std::make_shared<httplib::Server>();
#ifdef XMRIG_FEATURE_TLS
  }
#endif

  if (!m_srv->is_valid())
  {
    return -1;
  }

  xmrig::Log::print(GREEN_BOLD(" * ") WHITE_BOLD("%-13s") CSI "1;%dm%s:%d",
                    "LISTENING",
                    (m_config->useTLS() ? 32 : 36),
                    m_config->bindIp().c_str(),
                    m_config->port()
  );

  m_srv->Get(R"(/.*)", [this](const httplib::Request& req, httplib::Response& res)
  {
    res.status = this->m_service->handleGET(req, res);;
    addResponseHeader(res);
  });

  m_srv->Post(R"(/.*)", [this](const httplib::Request& req, httplib::Response& res)
  {
    res.status = m_service->handlePOST(req, res);;
    addResponseHeader(res);
  });

  auto ret = m_srv->set_mount_point("/client/updates", m_config->clientUpdateFolder());
  if (!ret) {
    LOG_ERR("Unable to find client-updates mount point");
  }

  m_srv->set_pre_routing_handler([this](const httplib::Request& req, httplib::Response& res) {
    auto handlerResponse = httplib::Server::HandlerResponse::Unhandled;

    int status;
    if (req.path.find("/client/") == 0)
    {
      status = this->bearerAuth(req, res);
    }
    else
    {
      status = this->basicAuth(req, res);
    }

    if (status != HTTP_OK)
    {
      res.status = status;
      addResponseHeader(res);
      handlerResponse =  httplib::Server::HandlerResponse::Handled;
    }
    else
    {
      const auto clientId = req.get_param_value("clientId");
      const auto remoteAddr = req.get_header_value("REMOTE_ADDR");

      LOG_INFO("[%s] %s %s%s%s", remoteAddr.c_str(), req.method.c_str(), req.path.c_str(),
               clientId.empty() ? "" : "/?clientId=", clientId.c_str());
    }

    return handlerResponse;
  });

  return m_srv->listen(m_config->bindIp().c_str(), m_config->port()) ? 0 : 1;
}

void Httpd::stop()
{
  if (m_srv->is_running())
  {
    m_srv->stop();
  }
}

int Httpd::basicAuth(const httplib::Request& req, httplib::Response& res)
{
  auto result = HTTP_UNAUTHORIZED;
  auto remoteAddr = req.get_header_value("REMOTE_ADDR");

  if (m_config->adminUser().empty() || m_config->adminPass().empty())
  {
    res.set_content(std::string("<html><body\\>"
                                "Please configure admin user and pass to view this Page."
                                "</body><html\\>"), CONTENT_TYPE_HTML);

    result = HTTP_FORBIDDEN;

    LOG_ERR("[%s] %s %s (403 FORBIDDEN) - Admin user/password not set!",
            remoteAddr.c_str(), req.method.c_str(), req.path.c_str());
  }
  else
  {
    auto authHeader = req.get_header_value("Authorization");
    auto credentials = httplib::make_basic_authentication_header(m_config->adminUser(), m_config->adminPass());

    if (!authHeader.empty() && credentials.second == authHeader)
    {
      result = HTTP_OK;
    }
    else if (authHeader.empty())
    {
      LOG_WARN("[%s] %s %s (401 UNAUTHORIZED)",
               remoteAddr.c_str(), req.method.c_str(), req.path.c_str());
    }
    else
    {
      LOG_ERR("[%s] %s %s (403 FORBIDDEN) - Admin user/password wrong!",
              remoteAddr.c_str(), req.method.c_str(), req.path.c_str());
    }
  }

  res.status = result;

  return result;
}

int Httpd::bearerAuth(const httplib::Request& req, httplib::Response& res)
{
  auto result = HTTP_UNAUTHORIZED;
  auto remoteAddr = req.get_header_value("REMOTE_ADDR");

  if (m_config->token().empty())
  {
    LOG_WARN("[%s] %s %s (200 OK) - WARNING AccessToken not set!",
             remoteAddr.c_str(), req.method.c_str(), req.path.c_str());

    result = HTTP_OK;
  }
  else
  {
    auto authHeader = req.get_header_value("Authorization");
    auto credentials = std::string("Bearer ") + m_config->token();

    if (!authHeader.empty() && credentials == authHeader)
    {
      result = HTTP_OK;
    }
    else if (authHeader.empty())
    {
      LOG_WARN("[%s] %s %s (401 UNAUTHORIZED)",
               remoteAddr.c_str(), req.method.c_str(), req.path.c_str());
    }
    else
    {
      LOG_ERR("[%s] %s %s (403 FORBIDDEN) - AccessToken wrong!",
             remoteAddr.c_str(), req.method.c_str(), req.path.c_str());

      result = HTTP_FORBIDDEN;
    }
  }

  res.status = result;

  return result;
}
