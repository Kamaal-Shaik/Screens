$(function () {
    load_states('ddl_states_n');
    $('#ddl_states_n').change(function(){
        var state_val = $('#ddl_states_n').val();
        if (state_val != 0){
            load_remaining('ddl_districts_p', state_val, 'get_remaining', ['ddl_mandals_c']);
        }
    });
    $('#ddl_districts_p').change(function(){
        var state_val = $('#ddl_districts_p').val();
        if (state_val != 0){
            load_remaining('ddl_mandals_c', state_val, 'get_remaining', []);
        }
    });    
});