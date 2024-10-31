<?php
/** no direct access **/
defined('_WPLEXEC') or die('Restricted access');
?>
<script type="text/javascript">
jQuery(document).ready(function()
{
});

function ajax_multilingual_save(field_id, lang, value, item_id)
{
    var wpl_function = 'save_multilingual';
	var form_element_id = "#wpl_c_"+field_id+"_"+lang;
	
	var current_element_status = wplj(form_element_id).attr("disabled");
	wplj(form_element_id).attr("disabled", "disabled");
	
	var ajax_loader_element = '#wpl_listing_saved_span_'+field_id+"_"+lang;
	wplj(ajax_loader_element).html('<img src="<?php wpl_esc::e(wpl_global::get_wpl_asset_url('img/ajax-loader3.gif')); ?>" />');
	
	var request_str = 'wpl_format=b:listing:ajax&wpl_function='+wpl_function+'&dbst_id='+field_id+'&value='+encodeURIComponent(value)+'&item_id='+item_id+'&lang='+lang+'&_wpnonce=<?php wpl_esc::attr($this->nonce); ?>';
	
	/** run ajax query **/
	wplj.ajax({
		type: 'POST',
		dataType: 'JSON',
		url: '<?php wpl_esc::current_url(); ?>',
		data: request_str,
		success: function (data) {
			if(current_element_status != 'disabled') wplj(form_element_id).removeAttr("disabled");

			if(data.success == 1)
			{
				wplj(ajax_loader_element).html('');

				/** unfinalize property **/
				if(finalized)
				{
					ajax_save('', '', '0', item_id, '', '', 'finalize');
					finalized = 0;
					wplj("#wpl_listing_remember_to_finalize").show();
				}
			}
			else
			{
				wplj(ajax_loader_element).html('');
			}
		},
		error: function (jqXHR, textStatus, errorThrown) {
			if (ajax_loader_element)
				wplj(ajax_loader_element).html('');
		}
	});
}

function ajax_save(table_name, table_column, value, item_id, field_id, form_element_id, wpl_function)
{
	if(!wpl_function) wpl_function = 'save';
	if(!form_element_id) form_element_id = "#wpl_c_"+field_id;
	
	var current_element_status = wplj(form_element_id).attr("disabled");
	wplj(form_element_id).attr("disabled", "disabled");
	var element_type = wplj(form_element_id).attr('type');
	
	if(element_type == 'checkbox')
	{
		if(wplj(form_element_id).is(':checked')) value = 1;
		else value = 0;
	}
	
	var ajax_loader_element = '#wpl_listing_saved_span_'+field_id;
	wplj(ajax_loader_element).html('<img src="<?php wpl_esc::e(wpl_global::get_wpl_asset_url('img/ajax-loader3.gif')); ?>" />');
	
	var request_str = 'wpl_format=b:listing:ajax&wpl_function='+wpl_function+'&table_name='+table_name+'&table_column='+table_column+'&value='+encodeURIComponent(value)+'&item_id='+item_id+'&_wpnonce=<?php wpl_esc::attr($this->nonce); ?>';
	
	/** run ajax query **/
	wplj.ajax({
		type: 'POST',
		dataType: 'JSON',
		url: '<?php wpl_esc::current_url(); ?>',
		data: request_str,
		success: function (data) {
			if(current_element_status != 'disabled') wplj(form_element_id).removeAttr("disabled");

			if(data.success == 1)
			{
				wplj(ajax_loader_element).html('');

				/** unfinalize property **/
				if(finalized)
				{
					ajax_save('', '', '0', item_id, '', '', 'finalize');
					finalized = 0;
					wplj("#wpl_listing_remember_to_finalize").show();
				}
			}
			else
			{
				wplj(ajax_loader_element).html('');
			}
		},
		error: function (jqXHR, textStatus, errorThrown) {
			if (ajax_loader_element)
				wplj(ajax_loader_element).html('');
		}
	});
}

/** for saving items into the items table **/
function item_save(value, item_id, field_id, item_type, item_cat, item_extra1, item_extra2, item_extra3, form_element_id, wpl_function)
{
    if(!item_extra1) item_extra1 = '';
    if(!item_extra2) item_extra2 = '';
    if(!item_extra3) item_extra3 = '';
	if(!wpl_function) wpl_function = 'item_save';
	if(!form_element_id) form_element_id = "#wpl_c_"+field_id;
	
	var current_element_status = wplj(form_element_id).attr("disabled");
	wplj(form_element_id).attr("disabled", "disabled");
	var element_type = wplj(form_element_id).attr('type');
	
	if(element_type == 'checkbox')
	{
		if(wplj(form_element_id).is(':checked')) value = 1;
		else value = 0;
	}
	
	var ajax_loader_element = '#wpl_listing_saved_span_'+field_id;
	wplj(ajax_loader_element).html('<img src="<?php wpl_esc::e(wpl_global::get_wpl_asset_url('img/ajax-loader3.gif')); ?>" />');
	
	var request_str = 'wpl_format=b:listing:ajax&wpl_function='+wpl_function+'&value='+encodeURIComponent(value)+'&item_id='+item_id+'&item_type='+item_type+'&item_cat='+item_cat+'&item_extra1='+item_extra1+'&item_extra2='+item_extra2+'&item_extra3='+item_extra3+'&kind=<?php wpl_esc::attr($this->kind); ?>&_wpnonce=<?php wpl_esc::attr($this->nonce); ?>';
	
	/** run ajax query **/
	wplj.ajax({
		type: 'POST',
		dataType: 'JSON',
		url: '<?php wpl_esc::current_url(); ?>',
		data: request_str,
		success: function (data) {
			if(current_element_status != 'disabled') wplj(form_element_id).removeAttr("disabled");

			if(data.success == 1)
			{
				wplj(ajax_loader_element).html('');

				/** unfinalize property **/
				if(finalized)
				{
					ajax_save('', '', '0', item_id, '', '', 'finalize');
					finalized = 0;
					wplj("#wpl_listing_remember_to_finalize").show();
				}
			}
			else
			{
				wplj(ajax_loader_element).html('');
			}
		},
		error: function (jqXHR, textStatus, errorThrown) {
			if (ajax_loader_element)
				wplj(ajax_loader_element).html('');
		}
	});
}

function wpl_neighborhood_select(table_name, table_column, value, item_id, field_id)
{
	if(wplj('#wpl_c_'+field_id).is(':checked')) value = 1; else value = 0;
	
	wplj("#wpl_span_dis_"+field_id).slideToggle(100);
	ajax_save(table_name, table_column, value, item_id, field_id);
	
	if(value == 1)
	{
		wplj('#wpl_c_'+field_id+'_distance0').prop('checked', 'checked');
		ajax_save(table_name, table_column+'_distance_by', 1, item_id, field_id, '#wpl_c_'+field_id+'_distance0');
	}
	else
	{
		wplj('input[name=wpl_c_'+field_id+'_distance_by]:checked').removeAttr('checked');
		ajax_save(table_name, table_column+'_distance_by', '', item_id, field_id, '#wpl_c_'+field_id+'_distance0');
		
		wplj('#wpl_c_'+field_id+'_distance').val(0);
		ajax_save(table_name, table_column+'_distance', 0, item_id, field_id, '#wpl_c_'+field_id+'_distance');
	}
}

function wpl_neighborhood_distance_type_select(table_name, table_column, value, item_id, field_id, form_element_id)
{
	if(wplj('#wpl_c_'+field_id+'_distance').val() == '')
	{
		wplj('input[name=wpl_c_'+field_id+'_distance_by]:checked').prop('checked', '');
		wpl_alert("<?php wpl_esc::js_t("Please enter distance first!"); ?>");
	}
	else
	{
		ajax_save(table_name, table_column, value, item_id, field_id, form_element_id);
	}
}

function number_to_th(number)
{
	if(number > 10) return number + "th";
	else if(number == 1) return "<?php wpl_esc::js_t('First'); ?>";
	else if(number == 2) return "<?php wpl_esc::js_t('Second'); ?>";
	else if(number == 3) return "<?php wpl_esc::js_t('Third'); ?>";
	else if(number == 4) return "<?php wpl_esc::js_t('Fourth'); ?>";
	else if(number == 5) return "<?php wpl_esc::js_t('Fifth'); ?>";
	else if(number == 6) return "<?php wpl_esc::js_t('Sixth'); ?>";
	else if(number == 7) return "<?php wpl_esc::js_t('Seventh'); ?>";
	else if(number == 8) return "<?php wpl_esc::js_t('Eighth'); ?>";
	else if(number == 9) return "<?php wpl_esc::js_t('Ninth'); ?>";
	else if(number == 10) return "<?php wpl_esc::js_t('Tenth'); ?>";
}

function wpl_get_tinymce_content(html_element_id)
{
	if(wplj("#wp-"+html_element_id+"-wrap").hasClass("tmce-active"))
	{
        return tinyMCE.get(html_element_id).getContent();
	}
	else
	{
		return wplj("#"+html_element_id).val();
	}
}
</script>