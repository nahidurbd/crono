/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var crono = {
    check_session: function(redirect_from_home) {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "POST",
                url: '/crono/api/index.php/account/check',
                dataType: "json" ,
                data: {
                    token: $.sha1(token+uuid),
                }
                }).done(function( json_response ) {
                    //console.log(JSON.stringify(json_response));
                    if(json_response.status) {
                        $('#pleaseWaitDialog').modal('hide');
                        if(redirect_from_home) window.location.replace("timer.html"); 
                        $('#navbar_user_firstname').text(json_response.firstname + ' ' + json_response.lastname);
                        if(!json_response.is_admin) {
                           $('.admin-only').addClass('disabled').click(function(event) {
                              event.preventDefault(); 
                           });
                        }
                    } else {
                        window.location.replace("login.html");
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
                    window.location.replace("login.html");
            }); 
        } 
        else {
            window.location.replace("login.html");  
        }
    },
    
    populateCustomersTable: function() {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "GET",
                url: '/crono/api/index.php/customers/all/'+$.sha1(token+uuid),
                dataType: "json" 
                }).done(function( json_response ) {
                    if(!json_response.error) {
                        $('#customer-list-table tbody').html('');
                        for(var i=0; i<json_response.length; i++)
                        {
                            var row = $('<tr><td>'+json_response[i].customer_name+'</td></tr>');
                            var manage_col = $('<td></td>');
                            manage_col.append('<a href="#" class="btn btn-sm btn-warning btn-edit-customer" data-id="'+json_response[i].id+'" title="Edit"> <span class="glyphicon glyphicon-edit"></span> </a> ');
                            manage_col.append('<a href="#" class="btn btn-sm btn-danger btn-delete-customer" data-id="'+json_response[i].id+'" title="Delete"> <span class="glyphicon glyphicon-trash"></span> </a> ');
                            row.append(manage_col);
                            $('#customer-list-table tbody').append(row);
                        }
                        $('.btn-delete-customer').click(function(event) {
                            event.preventDefault();
                            if(confirm('Are you sure to delete this customer?')) {
                               var id = $(this).attr('data-id');
                               crono.deleteCustomer(id);
                            }
                        });
                        
                        $('.btn-edit-customer').click(function(event) {
                           event.preventDefault();
                           var id = $(this).attr('data-id');
                           $('#modal_container').load('modal/edit_customer.html', function() {
                               $('#btn_save_edit_customer').attr('data-id', id);
                               crono.readCustomer(id);
                               $('#btn_save_edit_customer').click(function(event){
                                   event.preventDefault();
                                   crono.updateCustomer($(this).attr('data-id'));
                               });
                               $('#modal_edit_customer').modal('show');
                           });
                        });
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            window.location.replace("login.html");  
        }    
    },
    
    populateProjectsTable: function() {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "GET",
                url: '/crono/api/index.php/projects/all/'+$.sha1(token+uuid),
                dataType: "json" 
                }).done(function( json_response ) {
                    if(!json_response.error) {
                        $('#project-list-table tbody').html('');
                        for(var i=0; i<json_response.length; i++)
                        {
                            var status = (json_response[i].closed) ? 'Closed' : 'Open';
                            var row = $('<tr><td>'+json_response[i].name+'</td><td>'+json_response[i].customer_name+'</td><td>'+status+'</td></tr>');
                            var manage_col = $('<td></td>');
                            manage_col.append('<a href="#" class="btn btn-sm btn-warning btn-edit-project" data-id="'+json_response[i].id+'" title="Edit"> <span class="glyphicon glyphicon-edit"></span> </a> ');
                            manage_col.append('<a href="#" class="btn btn-sm btn-danger btn-delete-project" data-id="'+json_response[i].id+'" title="Delete"> <span class="glyphicon glyphicon-trash"></span> </a> ');
                            row.append(manage_col);
                            $('#project-list-table tbody').append(row);
                        }
                        $('.btn-delete-project').click(function(event) {
                           event.preventDefault();
                           if(confirm('Are you sure to delete this project?')) {
                               var id = $(this).attr('data-id');
                               crono.deleteProject(id);
                           }
                        });
                        
                        $('.btn-edit-project').click(function(event) {
                           event.preventDefault();
                           var id = $(this).attr('data-id');
                           $('#modal_container').load('modal/edit_project.html', function() {
                               $('#edit_project_customer_list').chosen({allow_single_deselect:true});
                               $('#edit_project_status').chosen({disable_search_threshold: 3});
                               crono.populateCustomers('#edit_project_customer_list');
                               $('#btn_save_edit_project').attr('data-id', id);
                               crono.readProject(id);
                               $('#btn_save_edit_project').click(function(event){
                                   event.preventDefault();
                                   crono.updateProject($(this).attr('data-id'));
                               });
                               $('#modal_edit_project').modal('show');
                           });
                        });
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            window.location.replace("login.html");  
        }    
    },
    
    populateCustomers: function(chosen_element, choice) {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "GET",
                url: '/crono/api/index.php/customers/all/'+$.sha1(token+uuid),
                dataType: "json" 
                }).done(function( json_response ) {
                    if(!json_response.error) {
                        $(chosen_element).find('option').remove();
                        $(chosen_element).append('<option>No Customer</option>');
                        for(var i=0; i<json_response.length; i++)
                        {
                            $(chosen_element).append($('<option>', {
                                value: json_response[i].id,
                                text: json_response[i].customer_name
                            }));
                        }
                        if(choice!=null) $(chosen_element).val(choice).trigger("chosen:updated");
                        else $(chosen_element).val('').trigger("chosen:updated"); 
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            window.location.replace("login.html");  
        }
    },
    
    populateLastTimerEntries: function(only_current_user) {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "GET",
                url: '/crono/api/index.php/timer/all/'+only_current_user+'/'+$.sha1(token+uuid),
                dataType: "json" 
                }).done(function( json_response ) {
                    if(!json_response.error) {
                        $('#last_timer_entries').html($(''));
                        for(var i=0; i<json_response.length; i++)
                        {
                            $('#last_timer_entries').append('<a href="#" class="list-group-item">'+json_response[i].task+'<b><span class="pull-right">'+json_response[i].duration+'</span></b></a>')
                        }
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            window.location.replace("login.html");  
        }
    },
    
    populateProjects: function() {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "GET",
                url: '/crono/api/index.php/projects/all/'+$.sha1(token+uuid),
                dataType: "json" 
                }).done(function( json_response ) {
                    if(!json_response.error) {
                        $('#project_list').find('option').remove();
                        $('#project_list').append($('<option></option>'));
                        for(var i=0; i<json_response.length; i++)
                        {
                            $('#project_list').append($('<option>', {
                                value: json_response[i].id,
                                text: json_response[i].name
                            }));
                        }
                        $('#project_list').val('').trigger("chosen:updated");
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            window.location.replace("login.html");  
        }
    },
    
    startTimer: function() {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "POST",
                url: '/crono/api/index.php/timer/',
                dataType: "json",
                data: {
                    token: $.sha1(token+uuid),
                    task: $('#task').val(),
                    project_id: $('#project_list').val()
                }
                }).done(function( json_response ) {
                    if(json_response.status) {
                       crono.timer.start = new Date();
                       crono.timer.timerID = setInterval(crono.timer.tick, 10);
                       crono.timer.run = true;
                       crono.timer.activeId = json_response.last_inserted_id;
                       $('#btn-start-stop').html('<span class="fa fa-stop"></span> Stop');
                       $('#btn-start-stop').removeClass('btn-success');
                       $('#btn-start-stop').addClass('btn-danger');
                       $('#navbar_timer').removeClass('hide');
                    } else {
                        //Error handler
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            window.location.replace("login.html");  
        }
    },
    
    stopTimer: function() {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "PUT",
                url: '/crono/api/index.php/timer/',
                dataType: "json",
                data: {
                    token: $.sha1(token+uuid),
                    task: $('#task').val(),
                    project_id: $('#project_list').val(),
                    id: crono.timer.activeId
                }
                }).done(function( json_response ) {
                    if(json_response.status) {
                       clearTimeout(crono.timer.timerID);
                       crono.timer.run = false;
                       $('#btn-start-stop').html('<span class="fa fa-play"></span> Start');
                       $('#btn-start-stop').removeClass('btn-danger');
                       $('#btn-start-stop').addClass('btn-success');
                       $('#navbar_timer').addClass('hide');
                       $(".chosen-select").val('').trigger('chosen:updated');
                       crono.timer.activeId = null;
                       $("#home_timer").text("00:00:00");
                       $('#task').val('');
                       crono.populateLastTimerEntries(1);
                    } else {
                        //Error handler
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            window.location.replace("login.html");  
        }
    },
    
    addCustomer: function(from_project) {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "POST",
                url: '/crono/api/index.php/customers/',
                dataType: "json",
                data: {
                    token: $.sha1(token+uuid),
                    customer_name: $('#new_customer_name').val()
                }
                }).done(function( json_response ) {
                    if(json_response.status) {
                        if(from_project) {
                            crono.populateCustomers('#new_project_customer_list', json_response.last_inserted_id);
                        }
                        else crono.populateCustomersTable();
                        
                        $('#new_customer_name').val('');
                        $('#modal_new_customer').modal('hide');
                    } else {
                        //Error handler
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            window.location.replace("login.html");  
        }
    },
    
    readCustomer: function(id) {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        
        if(token && uuid) {
            $.ajax({
                type: "GET",
                url: '/crono/api/index.php/customer/'+id+'/'+$.sha1(token+uuid),
                dataType: "json",
                }).done(function( json_response ) {
                    if(json_response.status) {
                        $('#edit_customer_name').val(json_response.customer.customer_name);
                    } else {
                        //TODO Error handler
                        console.log('Error during deleting project');
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            window.location.replace("login.html");  
        }
    },
    
     updateCustomer: function(id) {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "PUT",
                url: '/crono/api/index.php/customers/',
                dataType: "json",
                data: {
                    token: $.sha1(token+uuid),
                    id: id,
                    customer_name: $('#edit_customer_name').val(),
                }
                }).done(function( json_response ) {
                    if(json_response.status) {
                        crono.populateCustomersTable();
                        $('#modal_edit_customer').modal('hide');
                    } else {
                        //Error handler
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            window.location.replace("login.html");  
        }
    },
    
    deleteCustomer: function(id) {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "DELETE",
                url: '/crono/api/index.php/customer/'+id+'/'+$.sha1(token+uuid),
                dataType: "json",
                }).done(function( json_response ) {
                    if(json_response.status) {
                        crono.populateCustomersTable();
                    } else {
                        //TODO Error handler
                        console.log('Error during deleting customer');
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            window.location.replace("login.html");  
        }
    },
    
    addProject: function(from_dashboard) {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "POST",
                url: '/crono/api/index.php/projects/',
                dataType: "json",
                data: {
                    token: $.sha1(token+uuid),
                    name: $('#new_project_name').val(),
                    customer_id: $('#new_project_customer_list').val()
                }
                }).done(function( json_response ) {
                    if(json_response.status) {
                        if(from_dashboard) crono.populateProjects();
                        else crono.populateProjectsTable();
                        $('#new_project_name').val('');
                        $('#modal_new_project').modal('hide');
                    } else {
                        //Error handler
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            window.location.replace("login.html");  
        }
    },
    
    updateProject: function(id) {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "PUT",
                url: '/crono/api/index.php/projects/',
                dataType: "json",
                data: {
                    token: $.sha1(token+uuid),
                    id: id,
                    name: $('#edit_project_name').val(),
                    customer_id: $('#edit_project_customer_list').val(),
                    closed: $('#edit_project_status').val()
                }
                }).done(function( json_response ) {
                    if(json_response.status) {
                        crono.populateProjectsTable();
                        $('#modal_edit_project').modal('hide');
                    } else {
                        //Error handler
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            window.location.replace("login.html");  
        }
    },
    
     readProject: function(id) {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        
        if(token && uuid) {
            $.ajax({
                type: "GET",
                url: '/crono/api/index.php/project/'+id+'/'+$.sha1(token+uuid),
                dataType: "json",
                }).done(function( json_response ) {
                    if(json_response.status) {
                        $('#edit_project_name').val(json_response.project.name);
                        //console.log(json_response.project.status);
                        $('#edit_project_status').val(json_response.project.status).trigger('chosen:updated');
                        $('#edit_project_customer_list').val(json_response.project.customer_id).trigger('chosen:updated');
                    } else {
                        //TODO Error handler
                        console.log('Error during deleting project');
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            window.location.replace("login.html");  
        }
    },
    
    deleteProject: function(id) {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "DELETE",
                url: '/crono/api/index.php/project/'+id+'/'+$.sha1(token+uuid),
                dataType: "json",
                }).done(function( json_response ) {
                    if(json_response.status) {
                        crono.populateProjectsTable();
                    } else {
                        //TODO Error handler
                        console.log('Error during deleting project');
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
        } 
        else {
            window.location.replace("login.html");  
        }
    },
    
    logout: function() {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "POST",
                url: '/crono/api/index.php/account/logout',
                dataType: "json" ,
                data: {
                    token: $.sha1(token+uuid),
                }
                }).done(function( json_response ) {
                    if(json_response.status) {
                        $.removeCookie('token'); 
                        $.removeCookie('client_secret_uuid');
                        window.location.replace("login.html");
                    } else {
                        window.location.replace("login.html");
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
                    window.location.replace("login.html");
            }); 
        } 
        else {
            window.location.replace("login.html");  
        } 
    },
    
    login: function(username, password) {
        var client_secret_uuid = crono.createUUID();
        $.ajax({
                type: "POST",
                url: '/crono/api/index.php/account/login',
                dataType: "json" ,
                data: {
                    username: username,
                    password: password,
                    client_secret_uuid: client_secret_uuid,
                }
                }).done(function( json_response ) {
                    if(json_response.status) {
                        $.cookie('client_secret_uuid', client_secret_uuid);
                        $.cookie('token', json_response.token);
                        window.location.replace("timer.html"); 
                    } else {
                        $('#login_error').html(json_response.error);
                    }
             }).fail(function(jqXHR, textStatus) {
                    console.log( "Request failed: " + textStatus + " " + jqXHR.status );
            }); 
    },
    
    createUUID: function() {
        // http://www.ietf.org/rfc/rfc4122.txt
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";

        var uuid = s.join("");
        return uuid;
    },
    
    timer : {
        startTime : 0,
        start : 0,
        end : 0,
        diff : 0,
        timerID : 0,
        run: false,
        activeId: null,
        tick: function() {
            crono.timer.end = new Date();
            crono.timer.diff = crono.timer.end - crono.timer.start;
            crono.timer.diff = new Date(crono.timer.diff);
            var sec = crono.timer.diff.getSeconds();
            var min = crono.timer.diff.getMinutes();
            var hr = crono.timer.diff.getHours()-1;
            sec = (sec < 10) ? "0" + sec : sec;
            min = (min < 10) ? "0" + min : min;
            hr = (hr < 10) ? "0" + hr : hr;
            $("#home_timer").text(hr+":"+min+":"+sec);
            $("#project-timer").text(hr+":"+min+":"+sec);
            $('#project-timer-name').text($('#task').val());
            
        }
    },
    
    updateAccountInfo: function() {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "PUT",
                url: '/crono/api/index.php/account',
                dataType: "json",
                data: {
                    token: $.sha1(token+uuid),
                    firstname: $('#edit-account-firstname').val(),
                    lastname: $('#edit-account-lastname').val(),
                    gitlab_private_key: $('#edit-account-gitlab_private_key').val(),
                    new_password: $('#edit-account-new-password').val(),
                    new_password_confirm: $('#edit-account-new-password-confirm').val(),
                }
                }).done(function( json_response ) {
                    if(json_response.status) {
                       //ok
                       crono.check_session(false);
                       $('#modal_edit_account').modal('hide');
                    }
                });
         }    
    },
    
    loadAccountInfo: function() {
        token = $.cookie('token');
        uuid = $.cookie('client_secret_uuid');
        if(token && uuid) {
            $.ajax({
                type: "GET",
                url: '/crono/api/index.php/account/info/'+$.sha1(token+uuid),
                dataType: "json"
                }).done(function( json_response ) {
                    if(json_response.status) {
                        $('#edit-account-firstname').val(json_response.user.firstname);
                        $('#edit-account-lastname').val(json_response.user.lastname);
                        $('#edit-account-gitlab_private_key').val(json_response.user.gitlab_private_key);
                    }
                });
         }
    }
};

//Operations for every pages must be placed here 
$( document ).ready(function() {
    $('body').append($('<div id="modal_container"></div>'));

    $('#btn_edit_settings').click(function(event) {
       event.preventDefault();
       $('#modal_container').load('modal/account.html', function() {
           $('#modal_edit_account').modal('show');
           crono.loadAccountInfo();
           $('#btn_update_account_info').click(function(event) {
              event.preventDefault();
              crono.updateAccountInfo();
           });
       }); 
       
    });
});