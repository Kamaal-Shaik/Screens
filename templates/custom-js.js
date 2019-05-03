$(function () {

    load_states('ddl_state_n');
    $('#ddl_state_n').change(function(){
        var state_val = $('#ddl_state_n').val();
        if (state_val != 0){
            load_remaining('ddl_district_n', state_val, 'get_remaining', ['ddl_mandal_p', 'ddl_village_c']);
        }
    });

    $('#ddl_district_n').change(function(){
        var state_val = $('#ddl_district_n').val();
        if (state_val != 0){
            load_remaining('ddl_mandal_p', state_val, 'get_remaining', ['ddl_village_c']);
        }
    });

    $('#ddl_mandal_p').change(function(){
        var state_val = $('#ddl_mandal_p').val();
        if (state_val != 0){
            load_remaining('ddl_village_c', state_val, 'get_remaining', []);
        }
    });    

    var input = {}
    var btn_dict = {'add': {'url':'add_remaining', 'method':'POST'}, 
                    'edit': {'url':'update_remaining', 'method':'PUT'},
                    'delete': {'url':'delete_by_id', 'method':'DELETE'}};

    $("button").click(function() {
        ide = this.id.split('_')[1].toLowerCase();
        id_info = btn_dict[ide];
        parent_div_id = $(this).parent().closest('div').attr('id');
        child_parent = get_child_parent(parent_div_id); 
        valid=false;
        if (ide == 'edit' || ide == 'delete'){
            if (child_parent['id'][1].toString() != "0"){
                valid = true;
            }
        }else{
            if (child_parent.hasOwnProperty("parent_id")){
                if (child_parent['parent_id'][1].toString() != "0"){
                    valid = true;
                }
            }else{
                valid = true;
            }
        }     

        if (valid == true){
            url = global_url+id_info['url'];
            if ((ide == 'edit') || (ide == 'add')){
                child_text = $('#'+child_parent['id'][0]+' option:selected').text();
                data = {'id': child_parent['id'][1], 'name': child_text};
                divs = { 'child_div': child_parent['id'][0] };
                if (child_parent.hasOwnProperty("parent_id")){
                    data['parent_id'] = child_parent['parent_id'][1];
                    divs['parent_div'] = child_parent['parent_id'][0];
                }else{
                    data['parent_id'] = "0";
                }
                input = {'url':url, 'data': data, 'method': id_info['method'], 'divs': divs};                
                
                if (ide == 'add'){
                    $('#txt_common_dialog').val('');
                }else{
                    $('#txt_common_dialog').val(child_text);
                }
                $('#div_common_dialog').dialog('open');
            }else{
                var ins_res = call_ajax(id_info['method'], url, {'id': child_parent['id'][1]}, {'Content-Type': 'application/json'})
                if (ins_res['result'] == 'success'){
                    try{
                        load_remaining(child_parent['id'][0], String(child_parent['parent_id'][1]), 'get_remaining', []);
                    }catch{
                        load_remaining(child_parent['id'][0], "0", 'get_remaining', []);
                    }                  
                    
                }else{
                    alert(JSON.stringify(ins_res['data']))
                }                
            }
        }else{
            alert('Please select mandatory fields.')
        }
    });


    $('#div_common_dialog').dialog({
        // open:function(event, ui){
        //     $('#txt_add_new_acc_type').val('');
        //     $('#txt_add_new_acc_type_desc').val('') ;
        // },        
        title: 'Add New Name',
        draggable: true,
        resizable: false,
        closeOnEscape: true,
        modal: true,
        autoOpen: false,
        buttons:[{
                id: 'btn_modal_add_name',
                text: 'Add New Name',
                click: add_new_name_dialog_save
            },
            {
                id:"btn_modal_add_new_name_cancel",
                text: "Cancel",
                click: function() {
                    $(this).dialog("close");
                }
            }]
    });    

    function add_new_name_dialog_save(){
        id_val = $('#txt_common_dialog').val();
        if (id_val != ''){
            input['data']['name'] = id_val;
            // alert(JSON.stringify(input));
            var ins_res = call_ajax(input['method'], input['url'], input['data'], {'Content-Type': 'application/json'})
            // alert(JSON.stringify(ins_res));
            if (ins_res['result'] == 'success'){
                load_remaining(input['divs']['child_div'], input['data']['parent_id'], 'get_remaining', []);
                $('#div_common_dialog').dialog('close');
            }else{
                alert(JSON.stringify(ins_res['data']))
            }
        }else{
            alert('Please enter field name.')
        }
    }

    function get_child_parent(div_id){
        var dict = {};
        $('#'+div_id +' select').each(function(){
            id = $(this).attr('id');
            val = $(this).val();
            if (id.split('_')[2] == 'p'){
                dict['parent_id'] = [id, val];
            }else if (id.split('_')[2] == 'c'){
                dict['id'] = [id, val];
            }
        });
        return dict
    }
});

var global_url = 'http://localhost:5000/';

function load_values_in_dropdowns(ddl_id, default_test, data_lst, key_text, value_text){
    jQuery("#"+ddl_id).html('');
    jQuery("#"+ddl_id).append(jQuery("<option></option>").val("0").html(default_test));
    if (data_lst.length > 0){        
        for (var i = 0; i < data_lst.length; i++) {
            jQuery("#"+ddl_id).append(jQuery("<option></option>").val(data_lst[i][key_text]).html(data_lst[i][value_text]));
        }
    }
}

function load_remaining(ddl_id, parent_id, url_co, child_ids){
    var url_for_init = global_url+url_co+'/'+parent_id;
    var init_data = call_ajax('get', url_for_init, {}, {'Content-Type': 'application/json'});
    if (init_data['result'] == 'success'){
        var res = init_data['data'];
        load_values_in_dropdowns(ddl_id, 'Select', res, 'id', 'name');
    }else{
        // alert(init_data['data']);
        load_values_in_dropdowns(ddl_id, 'Select', [], '', '');
    }
    if (child_ids.length > 0){
        for(i=0;i<child_ids.length;i++){
            load_values_in_dropdowns(child_ids[i], 'Select', [], '', '');
        }
    }
}

function load_states(ddl_id){
    var url_for_init = global_url+'get_states';       
    var init_data = call_ajax('get', url_for_init, {}, {'Content-Type': 'application/json'});
    if (init_data['result'] == 'success'){
        var res = init_data['data'];
        load_values_in_dropdowns(ddl_id, 'Select', res, 'id', 'name');
    }else{
        alert(init_data['data']);
        load_values_in_dropdowns(ddl_id, 'Select', [], '', '');
    }        
}

function call_ajax(method="",url="",params={},headers={}){
    // alert(JSON.stringify(params));
    var res = [];
    var parameters = {
        type: method,
        url: url,
        // dataType: 'jsonp',
        async: false,
        data: JSON.stringify(params),
        headers: headers,
        success: function(data, textStatus, jqXHR){
            // alert(JSON.stringify(data));
            return res.push({result:data['status'], data : data['info'] });
        },
        error: function(jqXHR, exception){
            // alert(JSON.stringify(jqXHR));
            res.push({ result:'failed', data: jqXHR });
        }
    }
    if (method.toLowerCase() == 'post'){
        parameters.dataType = 'json';
        parameters.contentType = 'application/json; charset=utf-8';
    }
    // alert(JSON.stringify(parameters));
    jQuery.ajax(parameters);
    return res[0]
}