var THRESHOLD_IN_MS = 60 * 1000;
            var RELOAD_INTERVAL_IN_MS = 10 * 1000;
            var CHART_RELOAD_INTERVAL_IN_MS = 60 * 1000;
    
            var latestRelease = "";
            var currentServerTime = 0;
            var clockDrift = 0;
    
            var latestVersion = 0;
            var currentVersion = 0;
    
    
    (function($) { "use strict";
    
    $(function() {
        var header = $(".start-style");
        $(window).scroll(function() {    
            var scroll = $(window).scrollTop();
        
            if (scroll >= 10) {
                header.removeClass('start-style').addClass("scroll-on");
            }
             else {
                header.removeClass("scroll-on").addClass('start-style');
            }
        });
    });		
        
    //Animation
    
    $(document).ready(function() {
        $('body.xmrigCC').removeClass('xmrigCC');
    });
    
    //Menu On Hover
        
    $('body').on('mouseenter mouseleave','.nav-item',function(e){
            if ($(window).width() > 750) {
                var _d=$(e.target).closest('.nav-item');_d.addClass('show');
                setTimeout(function(){
                _d[_d.is(':hover')?'addClass':'removeClass']('show');
                },1);
            }
    });	
    
    //Switch light/dark
    
    $("#switch").on('click', function () {
        $(".navbar-brand").toggleClass("dark-mode-logo")
        if ($("body").hasClass("dark")) {
            $("body").removeClass("dark");
            $("#switch").removeClass("switched");
            $("#light-mode").css("color", "#02ABE4");
            $("#dark-mode").css("color", "#000");
            $("#github").css("color", "#171515");
        }
        else {
            $("body").addClass("dark");
            $("#switch").addClass("switched");
            $("#light-mode").css("color", "#fff");
            $("#dark-mode").css("color", "#02ABE4");
            $("#github").css("color", "#fff");
        }
    });  
    
    })(jQuery); 
    
            
    
            $.fn.dataTable.ext.search.push(
                function (settings, data, dataIndex) {
    
                    var hideOffline = $('#hideOffline').prop('checked');
                    var showNotification = $('#showOfflineNotification').prop('checked');
    
                    var clientId = settings.aoData[dataIndex]._aData.client_status.client_id;
                    var lastStatus = settings.aoData[dataIndex]._aData.client_status.last_status_update * 1000;
    
                    var online = isOnline(lastStatus);
    
                    if (!online) {
                        var threshold = currentServerTime - (THRESHOLD_IN_MS + RELOAD_INTERVAL_IN_MS);
                        if (lastStatus > threshold && showNotification) {
                            $("#notificationBar").after('<div class="alert alert-danger alert-dismissable fade in">' +
                                '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
                                '<strong>Miner ' + clientId + ' just went offline!</strong> Last update: ' + new Date(lastStatus) +
                                '</div>');
                        }
                    }
    
                    return (online || !hideOffline);
                }
            );
    
            $(document).ready(function () {
                var table = $('#clientStatusList').DataTable({
                    dom: "<'row'<'col-sm-12'B>><'row rowPadded'<'col-sm-9'l><'col-sm-3'f>><'row'<'col-sm-12't>><'row'<'col-sm-4'i><'col-sm-8'p>><'col-sm-13'<'#serverTime'>>",
                    lengthMenu: [ [10, 25, 50, 100, -1], [10, 25, 50, 100, "All"] ],
                    pageLength: -1,
                    bPpaginate: true,
                    pagingType: "full_numbers",
                    stateSave: true,
                    ajax: {
                        url: "/admin/getClientStatusList",
                        dataSrc: 'client_status_list'
                    },
                    orderFixed: [5, 'asc'],
                    rowGroup: {
                        dataSrc: "client_status.current_algo_name"
                    },
                    columns: [
                        {
                            data: null,
                            defaultContent: '',
                            className: 'select-checkbox',
                            orderable: false
                        },
                        {data: "client_status.client_id", render: clientInfo},
                        {data: "client_status.version", render: version},
                        {data: "client_status.current_pool"},
                        {data: "client_status.current_pool_user", visible: false},
                        {data: "client_status.current_pool_pass", visible: false},
                        {data: "client_status.current_pool_rig_id", visible: false},
                        {data: "client_status.current_status", render: clientStatus},
                        {data: "client_status.current_algo_name", render: algoAndPowVariantName},
    
                        {data: "client_status.cpu_brand", visible: false},
                        {data: "client_status.external_ip", visible: false},
                        {data: "client_status.hugepages_available", visible: false},
                        {data: "client_status.hugepages_enabled", visible: false},
                        {data: "client_status.cpu_is_x64", visible: false},
                        {data: "client_status.cpu_has_aes", visible: false},
                        {data: "client_status.cpu_is_vm", visible: false},
                        {data: "client_status.hash_factor", className: "right", visible: false},
                        {data: "client_status.total_pages", className: "right", visible: false},
                        {data: "client_status.total_hugepages", className: "right", visible: false},
                        {data: null, render: clientHPpercent, className: "right", visible: false},
                        {data: "client_status.free_memory", render: memory, className: "right", visible: false},
                        {data: "client_status.total_memory", render: memory, className: "right", visible: false},
                        {data: "client_status.current_threads", className: "right", visible: false},
                        {data: "client_status.cpu_sockets", className: "right", visible: false},
                        {data: "client_status.cpu_cores", className: "right", visible: false},
                        {data: "client_status.cpu_threads", className: "right", visible: false},
                        {data: "client_status.cpu_l2", render: cache, className: "right", visible: false},
                        {data: "client_status.cpu_l3", render: cache, className: "right", visible: false},
                        {data: "client_status.cpu_nodes", className: "right", visible: false},
                        {data: "client_status.max_cpu_usage", className: "right", visible: false},
    
                        {data: "client_status.hashrate_short", render: round, className: "right"},
                        {data: "client_status.hashrate_medium", render: round, className: "right"},
                        {data: "client_status.hashrate_long", render: round, className: "right"},
                        {data: "client_status.hashrate_highest", render: round, className: "right"},
                        {data: "client_status.hashes_total", className: "right"},
                        {data: "client_status.avg_time", className: "right"},
                        {data: "client_status.shares_good", className: "right"},
                        {data: "client_status.shares_total", className: "right"},
                        {data: "client_status.uptime", render: uptime, className: "right"},
                        {data: "client_status.last_status_update", render: laststatus},
                        {
                            data: null,
                            defaultContent:
                                "<td class='center-tab'><button type='button' id='LOG' class='btn btn-xs btn-info' data-toggle='tooltip' title='View miner log'><i class='fa fa-file-text-o'></i></button></td>",
                            orderable: false,
                            className: "center-tab"
                        },
                        {
                            data: null,
                            defaultContent:
                                "<td class='center-tab'><button type='button' id='EDIT' class='btn btn-xs btn-primary' data-toggle='tooltip' title='Edit miner config'><i class='fa fa-edit'></i></button></td>",
                            orderable: false,
                            className: "center-tab"
                        }
                    ],
                    rowId: 'client_status.client_id',
                    select: {
                        style: "multi+shift"
                    },
                    order: [1, 'asc'],
                    buttons: [
                        'colvis',
                        {
                            text: '<i class="fa fa-upload"> Push miner config</i>',
                            className: 'btn-primary',
                            enabled: false,
                            action: function () {
                                table.rows({selected: true}).eq(0).each(function (index) {
                                    var row = table.row(index);
                                    var data = row.data();
    
                                    sendAction("UPDATE_CONFIG", data.client_status.client_id);
                                });
                            }
                        },
                        {
                            text: '<i class="fa fa-download"> Pull miner config</i>',
                            className: 'btn-info',
                            enabled: false,
                            action: function () {
                                table.rows({selected: true}).eq(0).each(function (index) {
                                    var row = table.row(index);
                                    var data = row.data();
    
                                    sendAction("PUBLISH_CONFIG", data.client_status.client_id);
                                });
                            }
                        },
                        {
                            text: '<i class="fa fa-play"> Start</i>',
                            className: 'btn-success',
                            enabled: false,
                            action: function () {
                                table.rows({selected: true}).eq(0).each(function (index) {
                                    var row = table.row(index);
                                    var data = row.data();
    
                                    sendAction("START", data.client_status.client_id);
                                });
                            }
                        },
                        {
                            text: '<i class="fa fa-pause"> Pause</i>',
                            className: 'btn-warning',
                            enabled: false,
                            action: function () {
                                table.rows({selected: true}).eq(0).each(function (index) {
                                    var row = table.row(index);
                                    var data = row.data();
    
                                    sendAction("STOP", data.client_status.client_id);
                                });
                            }
                        },
                        {
                            text: '<i class="fa fa-repeat"> Restart</i>',
                            className: 'btn-info',
                            enabled: false,
                            action: function () {
                                table.rows({selected: true}).eq(0).each(function (index) {
                                    var row = table.row(index);
                                    var data = row.data();
    
                                    sendAction("RESTART", data.client_status.client_id);
                                });
                            }
                        },
                        {
                            text: '<i class="fa fa-sign-out"> Stop</i>',
                            className: 'btn-danger',
                            enabled: false,
                            action: function () {
                                $('#commandDialogStop').modal('show');
                            }
                        },
                        {
                            text: '<i class="fa fa-refresh"> Reboot</i>',
                            className: 'btn-warning',
                            enabled: false,
                            action: function () {
                                table.rows({selected: true}).eq(0).each(function (index) {
                                    var row = table.row(index);
                                    var data = row.data();
    
                                    sendAction("REBOOT", data.client_status.client_id);
                                });
                            }
                        },
                        {
                            text: '<i class="fa fa-rocket"> Execute</i>',
                            className: 'btn-success',
                            enabled: false,
                            action: function () {
                                $('#commandExecuteDialog').modal('show');
                            }
                        },
                        {
                            text: '<i class="fa fa-table"> Assign template</i>',
                            className: 'btn-info',
                            enabled: false,
                            action: function () {
                                $.ajax({
                                    type: "GET",
                                    url: "/admin/getClientConfigTemplates",
                                    dataType: "json",
                                    success: function (data) {
                                        var htmlContent = "";
    
                                        var arrayLength = data["templates"].length;
                                        for (var i = 0; i < arrayLength; i++) {
                                            htmlContent += "<option>" + data["templates"][i] + "</option>";
                                        }
    
                                        if (arrayLength > 0) {
                                            $('#assignTemplate').prop('disabled', false);
    
                                            $('#assignTemplateSelector').html(htmlContent);
                                            $('#assignTemplateSelector').selectpicker('refresh');
                                        } else {
                                            $('#assignTemplate').prop('disabled', true);
                                        }
    
                                        $('#assignTemplateEditor').modal('show');
                                    },
                                    error: function (data) {
                                        setError('<strong>Unable to fetch templates</strong> - Please make they exist!');
                                    }
                                });
                            }
                        },
                        {
                            text: '<i class="fa fa-edit"> Template Editor</i>',
                            className: 'btn-primary',
                            enabled: true,
                            action: function () {
                                $.ajax({
                                    type: "GET",
                                    url: "/admin/getClientConfigTemplates",
                                    dataType: "json",
                                    success: function (data) {
                                        var htmlContent = "";
    
                                        var arrayLength = data["templates"].length;
                                        for (var i = 0; i < arrayLength; i++) {
                                            htmlContent += "<option>" + data["templates"][i] + "</option>";
                                        }
    
                                        if (arrayLength > 0) {
                                            $('#templateEditorSave').prop('disabled', false);
                                            $('#templateEditorDeleteDialog').prop('disabled', false);
    
                                            $('#templateSelector').html(htmlContent);
                                            $('#templateSelector').selectpicker('refresh');
                                            $('#templateSelector').trigger('change');
                                        } else {
                                            $('#templateEditorSave').prop('disabled', true);
                                            $('#templateEditorDeleteDialog').prop('disabled', true);
                                        }
    
                                        $('#templateEditor').modal('show');
                                    },
                                    error: function (data) {
                                        setError('<strong>Unable to fetch templates</strong> - Please make they exist!');
                                    }
                                });
                            }
                        }
                    ],
    
                    "footerCallback": function (row, data, start, end, display) {
                        var api = this.api();
    
                        var sumHashrateShort = 0;
                        var sumHashrateMedium = 0;
                        var sumHashrateLong = 0;
                        var sumHashrateHighest = 0;
                        var sumHashesTotal = 0;
                        var avgTimeTotal = 0;
                        var sumSharesGood = 0;
                        var sumSharedTotal = 0;
    
                        var colOffset = 30;
    
                        sumHashrateShort = api
                            .column(colOffset, {page: 'current'})
                            .data()
                            .reduce(function (a, b) {
                                return a + b;
                            }, 0);
    
                        sumHashrateMedium = api
                            .column(colOffset+1, {page: 'current'})
                            .data()
                            .reduce(function (a, b) {
                                return a + b;
                            }, 0);
    
                        sumHashrateLong = api
                            .column(colOffset+2, {page: 'current'})
                            .data()
                            .reduce(function (a, b) {
                                return a + b;
                            }, 0);
    
                        sumHashrateHighest = api
                            .column(colOffset+3, {page: 'current'})
                            .data()
                            .reduce(function (a, b) {
                                return a + b;
                            }, 0);
    
                        sumHashesTotal = api
                            .column(colOffset+4, {page: 'current'})
                            .data()
                            .reduce(function (a, b) {
                                return a + b;
                            }, 0);
    
                        avgTimeTotal = api
                            .column(colOffset+5, {page: 'current'})
                            .data()
                            .reduce(function (a, b) {
                                return (a + b);
                            }, 0) / api.column(26, {page: 'current'}).data().length;
    
                        sumSharesGood = api
                            .column(colOffset+6, {page: 'current'})
                            .data()
                            .reduce(function (a, b) {
                                return a + b;
                            }, 0);
    
                        sumSharedTotal = api
                            .column(colOffset+7, {page: 'current'})
                            .data()
                            .reduce(function (a, b) {
                                return a + b;
                            }, 0);
    
                        sumHashrateShort = round(sumHashrateShort);
                        sumHashrateMedium = round(sumHashrateMedium);
                        sumHashrateLong = round(sumHashrateLong);
                        sumHashrateHighest = round(sumHashrateHighest);
                        avgTimeTotal = round(avgTimeTotal);
    
                        // update footer
                        $(api.column(colOffset).footer()).html(sumHashrateShort);
                        $(api.column(colOffset+1).footer()).html(sumHashrateMedium);
                        $(api.column(colOffset+2).footer()).html(sumHashrateLong);
                        $(api.column(colOffset+3).footer()).html(sumHashrateHighest);
                        $(api.column(colOffset+4).footer()).html(sumHashesTotal);
                        $(api.column(colOffset+5).footer()).html(avgTimeTotal);
                        $(api.column(colOffset+6).footer()).html(sumSharesGood);
                        $(api.column(colOffset+7).footer()).html(sumSharedTotal);
                    }
                });
    
                table.on('xhr.dt', function (e, settings, json, xhr) {
                    // check version
                    if (latestRelease === "" && json !== undefined) {
                        $.ajax({
                            url: "https://api.github.com/repos/Bendr0id/xmrigCC/releases/latest",
                            type: 'GET',
                            dataType: "json",
                            success: function (release) {
                                latestRelease = release.tag_name
                                latestVersion = parseInt(release.tag_name.split('.').join(""));
                                currentVersion = parseInt(json.current_version.split('.').join(""));
    
                                if (currentVersion < 1000) {
                                    currentVersion = currentVersion * 10;
                                }
    
                                if (latestVersion < 1000) {
                                    latestVersion = latestVersion * 10;
                                }
    
                                if (latestVersion > currentVersion) {
                                    $("#updateNotificationBar").html('<div class="alert alert-info alert-dismissable fade in">' +
                                        '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
                                        '<a href="https://github.com/Bendr0id/xmrigCC/releases/latest"><strong>Update!</strong> XMRigCC v' + latestRelease + ' is available for download\n</a>' +
                                        '</div>');
                                }
                            }
                        });
                    }
    
                    currentServerTime = settings.json.current_server_time * 1000;
                    clockDrift = new Date().getTime() - currentServerTime;
    
                    $('#serverTime').html("<div class='dataTables_info text-right'>" + new Date(currentServerTime) + "</div>");
                });
    
                table.on('select', function () {
                    var selectedRows = table.rows({selected: true}).count();
    
                    table.button(1).enable(selectedRows > 0);
                    table.button(2).enable(selectedRows > 0);
                    table.button(3).enable(selectedRows > 0);
                    table.button(4).enable(selectedRows > 0);
                    table.button(5).enable(selectedRows > 0);
                    table.button(6).enable(selectedRows > 0);
                    table.button(7).enable(selectedRows > 0);
                    table.button(8).enable(selectedRows > 0);
                    table.button(9).enable(selectedRows > 0);
                });
    
                table.on('deselect', function () {
                    var selectedRows = table.rows({selected: true}).count();
    
                    table.button(1).enable(selectedRows > 0);
                    table.button(2).enable(selectedRows > 0);
                    table.button(3).enable(selectedRows > 0);
                    table.button(4).enable(selectedRows > 0);
                    table.button(5).enable(selectedRows > 0);
                    table.button(6).enable(selectedRows > 0);
                    table.button(7).enable(selectedRows > 0);
                    table.button(8).enable(selectedRows > 0);
                    table.button(9).enable(selectedRows > 0);
                });
    
                table.buttons().container().appendTo('#clientStatusList_wrapper .col-sm-6:eq(0)');
    
                $('#hideOffline').change(function () {
                    table.draw();
                });
    
                $('#groupByAlgo').change(function () {
                    if ($('#groupByAlgo').prop('checked')) {
                        table.rowGroup().enable().draw();
                        table.order.fixed({
                            pre: [5, 'asc']
                        }).draw();
                    } else {
                        table.rowGroup().disable().draw();
                        table.order.fixed({
                            pre: []
                        }).draw();
                    }
                });
    
                $('#resetClientStatusList').click(function () {
                    resetClientStatusList();
                });
    
                $('#clientStatusList tbody ').on('click', 'button#EDIT', function () {
                    var data = table.row($(this).parents('tr')).data();
                    var clientId = data['client_status']['client_id'];
    
                    $.ajax({
                        type: "GET",
                        url: "/admin/getClientConfig?clientId=" + htmlDecode(clientId),
                        dataType: "json",
                        success: function (jsonClientConfig) {
                            var htmlContent = "<div class='form-group' id='editor' data-value='" + clientId + "'>" +
                                "<label for='config'>Config for: " + clientId + "</label>" +
                                "<textarea class='form-control' rows='20' id='config'>" +
                                JSON.stringify(jsonClientConfig, undefined, 2) +
                                "</textarea>" +
                                "</div>";
    
                            $('#minerEditor').find('.modal-body').html(htmlContent);
                            $('#minerEditor').modal('show');
                        },
                        error: function (data) {
                            setError('<strong>Unable to fetch ' + clientId + '_config.json</strong> - Please make sure that you pulled the config before!');
                        }
                    });
                });
    
                $('#minerEditorSave').click(function (event) {
                    var clientId = htmlEncode($('#minerEditor').find('.form-group')["0"].dataset.value);
                    var clientConfig = $('#config').val();
    
                    setClientConfig(clientId, clientConfig);
                });
    
                $('#templateEditorSave').click(function (event) {
                    var templateId = htmlEncode($('#templateSelector').val());
                    var template = $('#template').val();
    
                    setTemplateConfig(templateId, template);
                });
    
                $('#templateEditorSaveAsDialog').click(function (event) {
                    $('#templateDialogSaveAs').modal('show');
                });
    
                $('#templateEditorDeleteDialog').click(function (event) {
                    $('#templateDialogDelete').modal('show');
                });
    
                $('#templateEditorSaveAs').click(function (event) {
                    var templateId = htmlEncode($('#templateName').val());
                    var template = $('#template').val();
    
                    setTemplateConfig(templateId, template);
    
                    $('#templateEditor').modal('hide');
                });
    
                $('#templateEditorDelete').click(function (event) {
                    var templateId = htmlEncode($('#templateSelector').val());
    
                    deleteTemplateConfig(templateId, template);
                });
    
                $('#commandStop').click(function (event) {
                    table.rows({selected: true}).eq(0).each(function (index) {
                        var row = table.row(index);
                        var data = row.data();
    
                        sendAction("SHUTDOWN", data.client_status.client_id);
                    });
                });
    
                $('#commandExecuteDialogExecute').click(function (event) {
                    var command = $('#executeCommand').val();
    
                    table.rows({selected: true}).eq(0).each(function (index) {
                        var row = table.row(index);
                        var data = row.data();
    
                        sendAction("EXECUTE", data.client_status.client_id, command);
                    });
                });
    
                $('#clientStatusList tbody').on('click', 'button#LOG', function () {
                    var data = table.row($(this).parents('tr')).data();
                    var clientId = data['client_status']['client_id'];
                    var clientIp = data['client_status']['external_ip'];
    
                    $.ajax({
                        type: "GET",
                        url: "/admin/getClientLog?clientId=" + htmlDecode(clientId),
                        dataType: "json",
                        success: function (data) {
                            var htmlContent = "<div class='form-group' id='viewer' data-value='" + clientId + "'>" +
                                "<label for='config'>Log of: " + clientId + " (" + clientIp + ")</label>" +
                                "<textarea class='form-control' rows='20' id='log'>" + data.client_log + "</textarea>" +
                                "</div>";
    
                            $('#minerLog').find('.modal-body').html(htmlContent);
                            $('#minerLog').modal('show');
                        },
                        error: function (data) {
                            setError('<strong>Unable to fetch ' + clientId + ' log.</strong> - Please make sure it is enabled on the miner!');
                        }
                    });
                });
    
                $('#minerLogRefresh').click(function (event) {
                    var clientId = htmlEncode($('#minerLog').find('.form-group')["0"].dataset.value);
    
                    table.rows().eq(0).each(function (index) {
                        var row = table.row(index);
                        var data = row.data();
    
                        $.ajax({
                            type: "GET",
                            url: "/admin/getClientLog?clientId=" + htmlDecode(clientId),
                            dataType: "json",
                            success: function (data) {
                                $('#log').val(data.client_log);
                            },
                            error: function (data) {
                                setError('<strong>Unable to fetch ' + clientId + ' log.</strong> - Please make sure it is enabled on the miner!');
                            }
                        });
                    });
                });
    
                $('#templateSelector').on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
                    var selected = $(e.currentTarget).val();
                    $.ajax({
                        type: "GET",
                        url: "/admin/getClientConfig?clientId=template_" + selected,
                        dataType: "json",
                        success: function (jsonClientConfig) {
                            $('#template').val(JSON.stringify(jsonClientConfig, undefined, 2));
                        },
                        error: function (data) {
                            setError('<strong>Unable to fetch template ' + selected + '</strong> - Please make sure it readable!');
                        }
                    });
                });
    
                $('#assignTemplate').click(function (event) {
                    var template = $('#assignTemplateSelector').val();
                    $.ajax({
                        type: "GET",
                        url: "/admin/getClientConfig?clientId=template_" + template,
                        dataType: "json",
                        success: function (jsonTemplate) {
                            table.rows({selected: true}).eq(0).each(function (index) {
                                var row = table.row(index);
                                var data = row.data();
                                var clientId = data['client_status']['client_id'];
    
                                if ($('#mergeTemplate').prop('checked')) {
                                    setMergedClientConfig(jsonTemplate, clientId);
                                } else {
                                    jsonTemplate['cc-client']['worker-id'] = htmlDecode(clientId);
    
                                    clientConfig = JSON.stringify(jsonTemplate, undefined, 2);
    
                                    if ($('#replaceWorkerId').prop('checked')) {
                                        clientConfig = clientConfig.replace(new RegExp("@WORKER-ID@", 'g'), htmlDecode(clientId)).trim();
                                    }
    
                                    setClientConfig(clientId, clientConfig);
                                }
                            });
                        },
                        error: function (data) {
                            setError('<strong>Unable to fetch template ' + template + '</strong> - Please make sure it readable!');
                        }
                    });
                });
    
                $('#selectAllTop,#selectAllBottom').click(function () {
                    if ($("#selectAllTop").hasClass("fa fa-square-o")) {
                        $("#selectAllTop").removeClass("fa fa-square-o").addClass("fa fa-check-square-o");
                        $("#selectAllBottom").removeClass("fa fa-square-o").addClass("fa fa-check-square-o");
    
                        table.rows().select();
                    } else {
                        $("#selectAllTop").removeClass("fa fa-check-square-o").addClass("fa fa-square-o");
                        $("#selectAllBottom").removeClass("fa fa-check-square-o").addClass("fa fa-square-o");
    
                        table.rows().deselect();
                    }
                });
    
    
                var hashrateChart = new Chart(document.getElementById("hashrateChart").getContext("2d"), {
                    type: "line",
                    data: {
                        datasets: []
                    },
                    options: {
                        title:{
                            display:true,
                            text:'Hashrates'
                        },
                        tooltips: {
                            mode: 'nearest',
                            intersect: false,
                        },
                        scales: {
                            yAxes: [
                                {
                                    id: 'hashrate',
                                    position: 'left',
                                    scalePositionLeft: true,
                                    stacked: false,
                                    ticks: {
                                        beginAtZero: true
                                    },
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Hashrate',
                                        fontSize: 16
                                    }
                                }
                            ],
                            xAxes: [{
                                type: 'time',
                                distribution: 'series',
                                time: {
                                    unit: 'minute',
                                    displayFormats: {
                                        minute: 'HH:mm'
                                    }
                                },
                                ticks: {
                                    stepSize: 10,
                                    autoSkip: true,
                                    maxTicksLimit: 60
                                }
                            }]
                        },
                        elements: {
                            point:{
                                radius: 0
                            }
                        },
                        responsive: true,
                        maintainAspectRatio: false
                    },
                    plugins: {
                        colorschemes: {
                            scheme: 'brewer.Paired12'
                        }
                    }
                });
    
                var minerChart = new Chart(document.getElementById("minerChart").getContext("2d"), {
                    type: "line",
                    data: {
                        datasets: []
                    },
                    options: {
                        title:{
                            display:true,
                            text:'Miners'
                        },
                        tooltips: {
                            mode: 'nearest',
                            intersect: false,
                        },
                        scales: {
                            yAxes: [
                                {
                                    id: 'miner',
                                    position: 'left',
                                    scalePositionLeft: true,
                                    stacked: false,
                                    ticks: {
                                        beginAtZero: true,
                                        callback: function(value) {if (value % 1 === 0) {return value;}}
                                    },
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Miner',
                                        fontSize: 16
                                    }
                                }
                            ],
                            xAxes: [{
                                type: 'time',
                                distribution: 'series',
                                time: {
                                    unit: 'minute',
                                    displayFormats: {
                                        minute: 'HH:mm'
                                    }
                                },
                                ticks: {
                                    stepSize: 10,
                                    autoSkip: true,
                                    maxTicksLimit: 60
                                }
                            }]
                        },
                        elements: {
                            point:{
                                radius: 0
                            }
                        },
                        responsive: true,
                        maintainAspectRatio: false
                    },
                    plugins: {
                        colorschemes: {
                            scheme: 'brewer.Paired12'
                        }
                    }
                });
    
                Chart.plugins.register({
                    afterDraw: function(chart) {
                        if (chart.data.datasets.length === 0) {
                            // No data is present
                            var ctx = chart.chart.ctx;
                            var width = chart.chart.width;
                            var height = chart.chart.height
    
                            ctx.save();
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.font = "16px normal 'Helvetica Nueue'";
                            ctx.fillText('No data to display', width / 2, height / 2);
                            ctx.restore();
                        }
                    }
                });
    
                updateCharts(hashrateChart, minerChart);
    
                setInterval(function () {
                    table.ajax.reload(null, false);
                }, RELOAD_INTERVAL_IN_MS);
    
                setInterval(function () {
                    updateCharts(hashrateChart, minerChart);
                }, CHART_RELOAD_INTERVAL_IN_MS);
            });
            
            function clientHPpercent(data, type, row) {
            if (!row.client_status.hugepages_enabled || row.client_status.total_pages == 0) return 0;
                return Math.round(1000 * row.client_status.total_hugepages / row.client_status.total_pages) / 10;
            }
    
            function sendAction(action, clientId, payload) {
                var payloadContent = payload == null ? '' : ' [payload=\'' + payload +'\']';
                $.ajax({
                    type: "POST",
                    url: "/admin/setClientCommand?clientId=" + htmlDecode(clientId),
                    dataType: "text",
                    data: '{"control_command":{"command": "' + action + '", "payload": "' + payload + '"}}',
                    success: function (data) {
                        setSuccess('<strong>Successfully send ' + action + ' to ' + clientId + payloadContent + '</strong> - It can take up to 30s until the command is processed.');
                    },
                    error: function (data) {
                        setError('<strong>Failed to send ' + action + ' to ' + clientId + + payloadContent +'</strong> \nError: ' + JSON.stringify(data, undefined, 2));
                    }
                });
            }
    
            function resetClientStatusList() {
                $.ajax({
                    type: "POST",
                    url: "/admin/resetClientStatusList",
                    dataType: "text",
                    data: '{}',
                    success: function (data) {
                        setSuccess('<strong>Successfully send the reset client status list request to the Server.</strong> - Now just wait for the next refresh.');
                    },
                    error: function (data) {
                        setError('<strong>Failed to send the reset client status list request to the Server.</strong> \nError: ' + JSON.stringify(data, undefined, 2));
                    }
                });
            }
    
            function uptime(data, type, row) {
                if (type !== 'sort') {
                    var lastStatus = row.client_status.last_status_update * 1000;
    
                    if (isOnline(lastStatus)) {
                        return numeral(data / 1000).format('00:00:00:00');
                    } else {
                        return "";
                    }
                }
    
                return data;
            }
    
            function setMergedClientConfig(template, clientId) {
                $.ajax({
                    type: "GET",
                    url: "/admin/getClientConfig?clientId=" + htmlDecode(clientId),
                    dataType: "json",
                    success: function (clientConfig) {
                        $.extend(true, clientConfig, template);
    
                        clientConfig = JSON.stringify(clientConfig, undefined, 2)
    
                        if ($('#replaceWorkerId').prop('checked')) {
                            clientConfig = clientConfig.replace(new RegExp("@WORKER-ID@", 'g'), htmlDecode(clientId)).trim();
                        }
    
                        setClientConfig(clientId, clientConfig);
                    },
                    error: function (data) {
                        setError('<strong>Unable to fetch client config ' + clientId + ' for template merge</strong> - Please make sure it readable!');
                    }
                });
            }
    
            function laststatus(data, type, row) {
                if (type !== 'sort') {
                    var date = new Date(data * 1000 - clockDrift);
                    return '<span data-toggle="tooltip" title="' + date + '">' + jQuery.timeago(date) + '</span>';
                }
    
                return data;
            }
    
            function algoAndPowVariantName(data, type, row) {
                var algo = row.client_status.current_algo_name;
                var powVariant = row.client_status.current_pow_variant_name;
    
                if (powVariant !== "") {
                    return algo + " / " + powVariant
                } else {
                    return algo;
                }
            }
    
            function version(data, type, row) {
                var clientVersion = parseInt(row.client_status.version.split('.').join(""));
    
                if (clientVersion < 1000) {
                    clientVersion = clientVersion * 10;
                }
    
                if (latestVersion > clientVersion) {
                    return '<span data-toggle="tooltip" title="Outdated"><div class="offline">' + data + '</div></span>';
                } else {
                    return data;
                }
            }
    
            function clientStatus(data, type, row) {
                var lastStatus = row.client_status.last_status_update * 1000;
    
                if (isOnline(lastStatus)) {
                    return data;
                } else {
                    return "OFFLINE";
                }
            }
    
            function clientInfo(data, type, row) {
                if (type !== 'sort') {
                    var lastStatus = row.client_status.last_status_update * 1000;
                    var online = isOnline(lastStatus);
    
                    var tooltip = "CPU: " + row.client_status.cpu_brand + " (" + row.client_status.cpu_sockets + ") [" + row.client_status.cpu_cores + " cores / " + row.client_status.cpu_threads + " threads]";
                    tooltip += '\n';
                    tooltip += "CPU Flags: " + (row.client_status.cpu_has_aes ? "AES-NI " : "");
                    tooltip += (row.client_status.cpu_is_x64 ? "x64 " : "");
                    tooltip += (row.client_status.cpu_is_vm ? "VM" : "");
                    tooltip += '\n';
                    tooltip += "CPU Cache L2/L3: " + cache(row.client_status.cpu_l2) + " MB/" + cache(row.client_status.cpu_l3) + " MB";
                    tooltip += '\n';
                    tooltip += "CPU Nodes: " + row.client_status.cpu_nodes;
                    tooltip += '\n';
                    tooltip += "Max CPU usage: " + (row.client_status.max_cpu_usage > 0 ? row.client_status.max_cpu_usage : "100")  + "%";
                    tooltip += '\n';
                    tooltip += "Huge Pages: " + (row.client_status.hugepages_available ? " available, " : " unavailable, ");
                    tooltip += (row.client_status.hugepages_enabled ? "enabled (" + row.client_status.total_hugepages + "/" + row.client_status.total_pages + ")" : "disabled");
                    tooltip += '\n';
                    tooltip += "Used Threads: " + row.client_status.current_threads;
                    tooltip += (row.client_status.hash_factor > 1 ? " [" + row.client_status.hash_factor + "x multi hash mode]" : "");
                    tooltip += '\n';
                    tooltip += "Memory Free/Total: " + memory(row.client_status.free_memory) + " GB/" + memory(row.client_status.total_memory) + " GB";
                    tooltip += '\n';
    
                    if (row.client_status.gpu_info_list) {
                        for (var id in row.client_status.gpu_info_list) {
                            tooltip += "GPU #" + row.client_status.gpu_info_list[id].gpu_info.device_idx + ": ";
                            tooltip += row.client_status.gpu_info_list[id].gpu_info.name + ", "
                            tooltip += "intensity: " + row.client_status.gpu_info_list[id].gpu_info.raw_intensity + " ";
                            tooltip += "(" + row.client_status.gpu_info_list[id].gpu_info.work_size + "/" + row.client_status.gpu_info_list[id].gpu_info.max_work_size + "), ";
                            tooltip += "cu: " + row.client_status.gpu_info_list[id].gpu_info.compute_units;
                            tooltip += '\n';
                        }
                    }
    
                    tooltip += "Client IP: " + row.client_status.external_ip;
                    tooltip += '\n';
                    tooltip += "Version: " + row.client_status.version;
                    tooltip += '\n';
                    tooltip += "Status: " + online ? "Online" : "Offline";
    
                    if (online) {
                        return '<span data-toggle="tooltip" title="' + tooltip + '"><div class="online">' + data + '</div></span>';
                    } else {
                        return '<span data-toggle="tooltip" title="' + tooltip + '"><div class="offline">' + data + '</div></span>';
                    }
                }
    
                return data;
            }
    
            function round(data, type, row) {
                return Math.round(data * 100) / 100;
            }
    
            function memory(data, type, row) {
                return Math.round(data / 1024 / 1024 /1024 * 10) / 10;
            }
    
            function cache(data, type, row) {
                return Math.round(data / 1024 * 100) / 100;
            }
    
            function isOnline(lastStatus) {
                var threshold = currentServerTime - THRESHOLD_IN_MS;
                if (lastStatus > threshold) {
                    return true;
                } else {
                    return false;
                }
            }
    
            function setSuccess(info) {
                $("#statusBar").after('<div class="alert alert-success" role="alert">' +
                    '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                    info + '</div>');
    
                window.setTimeout(function () {
                    $(".alert-success").fadeTo(500, 0).slideUp(500, function () {
                        $(".alert-success").alert('close');
                    });
                }, 5000);
            }
    
            function setError(error) {
                $("#statusBar").after('<div class="alert alert-danger" role="alert">' +
                    '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                    error + '</div>');
    
                window.setTimeout(function () {
                    $(".alert-danger").fadeTo(500, 0).slideUp(500, function () {
                        $(".alert-danger").alert('close');
                    });
                }, 10000);
            }
    
            function setClientConfig(clientId, clientConfig) {
                $.ajax({
                    url: "/admin/setClientConfig?clientId=" + htmlDecode(clientId),
                    type: 'POST',
                    dataType: "text",
                    data: clientConfig,
                    success: function (data) {
                        setSuccess('<strong>Successfully updated config for: ' + clientId + '</strong> - You need push the config to the miner to apply the config.');
                    },
                    error: function (data) {
                        setError('<strong>Failed to update config for: ' + clientId + '</strong> \nError: ' + JSON.stringify(data, undefined, 2));
                    }
                });
            }
    
            function setTemplateConfig(templateId, templateConfig) {
                $.ajax({
                    url: "/admin/setClientConfig?clientId=template_" + htmlDecode(templateId),
                    type: 'POST',
                    dataType: "text",
                    data: templateConfig,
                    success: function (data) {
                        setSuccess('<strong>Successfully stored template: ' + templateId + '</strong> - You need to assign it to miners to apply.');
                    },
                    error: function (data) {
                        setError('<strong>Failed to store template: ' + templateId + '</strong> \nError: ' + JSON.stringify(data, undefined, 2));
                    }
                });
            }
    
            function deleteTemplateConfig(templateId) {
                $.ajax(	{
                    url: "/admin/deleteClientConfig?clientId=template_" + templateId,
                    type: 'POST',
                    dataType: "text",
                    data: '{}',
                    success: function (data) {
                        setSuccess('<strong>Successfully deleted template: ' + templateId + '</strong>');
                    },
                    error: function (data) {
                        setError('<strong>Failed to delete template: ' + templateId + '</strong> \nError: ' + JSON.stringify(data, undefined, 2));
                    }
                });
            }
    
            function updateCharts(hashrateChart, minerChart) {
    
                $.ajax({
                    url: '/admin/getClientStatistics',
                    dataType: 'json',
                }).done(function (results) {
    
                    var algos = results["client_statistics"].map(function(e) {
                        return e.algo;
                    });
    
                    var statistics = results["client_statistics"].map(function(e) {
                        return e.statistics;
                    });
    
                    var hashrateDatasets=[], minerDatasets=[];
                    for(var j = 0; j < results["client_statistics"].length; j++) {
                        var hashrates = statistics[j].map(function(e) {
                            return {
                                x: new Date(e.timestamp),
                                y: Math.round(e.hashrate * 100) / 100
                            }
                        });
    
                        var miners = statistics[j].map(function(e) {
                            return {
                                x: new Date(e.timestamp),
                                y: e.miner
                            }
                        });
    
                        hashrateDatasets.push({label: algos[j], type: 'line', data: hashrates, spanGraphs: false, fill: true});
                        minerDatasets.push({label: algos[j], type: 'line', data: miners, spanGraphs: false, fill: false});
                    }
    
                    hashrateChart.data.datasets = hashrateDatasets;
                    hashrateChart.update();
    
                    minerChart.data.datasets = minerDatasets;
                    minerChart.update();
                });
            }
    
            function htmlDecode(input) {
                var doc = new DOMParser().parseFromString(input, "text/html");
                return doc.documentElement.textContent;
            }
    
            function htmlEncode(input) {
                return input.replaceAll("&", "&amp;")
                            .replaceAll("<", "&lt;")
                            .replaceAll(">", "&gt;");
            }