$(function () {
    load_states('ddl_statesss_c');
    $('#ddl_statess_p').change(function(){
        var state_val = $('#ddl_statess_p').val();
        if (state_val != 0){
            load_remaining('ddl_districtss_c', state_val, 'get_remaining', []);
        }
    });   
});