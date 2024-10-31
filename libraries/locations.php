<?php
/** no direct access **/
defined('_WPLEXEC') or die('Restricted access');

/**
 * Locations Library
 * @author Howard <howard@realtyna.com>
 * @since WPL1.0.0
 * @date 04/07/2013
 * @package WPL
 */
class wpl_locations
{
    /**
     * Used for caching in get_location_abbr_by_name
     * @static
     * @var array
     */
    public static $abbrs_by_name = array();

    /**
     * Used for caching in get_location_name_by_abbr
     * @static
     * @var array
     */
    public static $names_by_abbr = array();

    /**
     * For updating a locaton record using location id
     * @author Howard <howard@realtyna.com>
     * @static
     * @param int $location_id
     * @param string $key
     * @param string $value
     * @param int $location_level
     * @return boolean
     */
	public static function update_location($location_id, $key, $value, $location_level = 1)
	{
		if(!$key or !$location_level) return false;

		return wpl_db::update("wpl_location{$location_level}", [$key => $value], 'id', $location_id);
	}

    /**
     * Deletes a location from database
     * @author Howard <howard@realtyna.com>
     * @static
     * @param int $location_id
     * @param int $level
     * @param boolean $recursive
     * @return boolean
     */
	public static function delete_location($location_id, $level = NULL, $recursive = false)
	{
		/** first validation **/
		if(!$level) return false;

		/** recursive remove locations **/
		if($recursive and $level != 'zips')
		{

			$sub_locations = wpl_db::select(wpl_db::prepare("SELECT * FROM %i WHERE `parent` = %d ", '#__wpl_location' . ($level+1), $location_id));

			if(count($sub_locations))
			{
				foreach($sub_locations as $location) self::delete_location($location->id, $level+1, $recursive);
			}
		}

		return wpl_db::delete("wpl_location{$level}", $location_id);
	}

    /**
     * Adds a new location to location database
     * @author Howard <howard@realtyna.com>
     * @static
     * @param string $name
     * @param string $abbr
     * @param int $level
     * @param int $parent
     * @return int
     */
	public static function add_location($name, $abbr, $level, $parent = 0)
	{
		// Get new location iD
		$location_id = self::get_new_location_id($level);

		$table = "wpl_location{$level}";
		$data = [
			'id' => $location_id,
			'name' => $name
		];
		if($level == 1) {
			$data['abbr'] = $abbr;
			$data['enabled'] = 1;
		}
		elseif($level != 'zips') {
			$data['abbr'] = $abbr;
			$data['parent'] = $parent;
		}
        else {
			$data['parent'] = $parent;
		}

		return wpl_db::insert($table, $data);
	}

	/**
     * Returns new location id
     * @author Howard R <howard@realtyna.com>
     * @static
     * @param int|string $level
     * @return int
     */
	public static function get_new_location_id($level)
	{
		$max_location_id = wpl_db::get("MAX(`id`)", "wpl_location".$level, '', '', false, '1');
		return max(($max_location_id+1), 0);
	}

    /**
     * Edits a location
     * @author Howard <howard@realtyna.com>
     * @static
     * @param string $name
     * @param string $abbr
     * @param int $level
     * @param int $location_id
     * @return mixed
     */
	public static function edit_location($name, $abbr, $level, $location_id)
	{
        $location_detail = self::get_location($location_id,$level);

        if($location_detail->name){
            wpl_db::q(wpl_db::prepare('UPDATE `#__wpl_properties` SET %i = %s WHERE %i = %s', "location{$level}_name", $name, "location{$level}_name", $location_detail->name), 'update');
        }

		if($level != 'zips') {
			return wpl_db::q(wpl_db::prepare("UPDATE %i SET `name` = %s, `abbr` = %s WHERE `id` = %d", "#__wpl_location{$level}", $name, $abbr, $location_id), 'update');
		}
		return wpl_db::q(wpl_db::prepare("UPDATE %i SET `name` = %s WHERE `id` = %d", "#__wpl_location{$level}", $name, $location_id), 'update');
	}

    /**
     * Returns locations
     * @author Howard <howard@realtyna.com>
     * @static
     * @param int $level
     * @param int $parent
     * @param int $enabled
     * @param string $condition
     * @param string $order_by - `name` ASC
     * @param string|int $limit
     * @return array
     */
	public static function get_locations($level = 1, $parent = NULL, $enabled = 0, $condition = '', $order_by = '`name` ASC', $limit = 300)
	{
		if( trim( $condition ?? '' ) == '')
		{
			$condition = "";

			if( trim( $parent ?? '' ) != '') $condition .= wpl_db::prepare("AND `parent` = %s", $parent);
			if($level == 1 and trim( $enabled ?? '' ) != '') $condition .= wpl_db::prepare("AND `enabled` = %d", $enabled);
		}

		if($limit and $limit != 0) {
			$offset_limit = str_replace('limit', '', strtolower($limit));
			$limit = explode(',', $offset_limit);
			if (count($limit) == 1) {
				$limit = wpl_db::prepare('LIMIT %d', $limit[0]);
			} else {
				$limit = wpl_db::prepare('LIMIT %d, %d', $limit[0], $limit[1]);
			}
		}

		return wpl_db::select(wpl_db::prepare("SELECT * FROM %i WHERE 1 ".$condition." ORDER BY ".$order_by." ".$limit, "#__wpl_location{$level}"));
	}

    /**
     * Returns a specific location data by id
     * @author Howard <howard@realtyna.com>
     * @static
     * @param int $location_id
     * @param int $level
     * @return object
     */
	public static function get_location($location_id = NULL, $level = 1)
	{
		if( trim( $location_id ?? '' ) == '') $location_id = 1;
		return wpl_db::get('*', "wpl_location".$level, 'id', $location_id);
	}

    /**
     * Returns location id by location name, parent id and level
     * @author Howard <howard@realtyna.com>
     * @static
     * @param string $location_name
     * @param int $parent_id
     * @param int $level
     * @return int
     */
	public static function get_location_id($location_name = '', $parent_id = NULL, $level = 1)
	{
		return wpl_db::select(wpl_db::prepare("SELECT `id` FROM %i WHERE name = %s ".($parent_id ? wpl_db::prepare(" AND `parent` = %s", $parent_id) : ""), "#__wpl_location{$level}", $location_name), 'loadResult');
	}

    /**
     * Returns location tree for creating breadcrumb and etc
     * @author Howard <howard@realtyna.com>
     * @static
     * @param int $location_id
     * @param int $parent
     * @return array
     */
	public static function get_location_tree($location_id, $parent)
	{
		$res = array();
		$i = 0;

		while($parent > 0)
		{
			$pr = $parent == 1 ? "" : ", `parent`";
			$items = wpl_db::select(wpl_db::prepare("SELECT `id`, `name`".$pr." FROM %i WHERE `id` = %d", "#__wpl_location{$parent}", $location_id));

			foreach($items as $item)
			{
				$res[$i]['id'] = $item->id;
				$res[$i]['name'] = $item->name;
				$location_id = $parent == 1 ? 0 : $item->parent;
			}

			$i++;
			$parent--;
		}

		return $res;
	}

    /**
     * Returns latitude and longitude of an address
     * @author Howard <howard@realtyna.com>
     * @static
     * @param string $address
     * @return array
     */
	public static function get_LatLng($address)
	{
		$address = trim($address ?? '', ", \t\n\r\0\x0B");
		$address = apply_filters('wpl_locations/get_LatLng/before_request', $address);

		if(empty($address)) {
			return array(0, 0);
		}

		$point = apply_filters('wpl_locations/get_LatLng/before_request/point', [], $address);

		if(!empty($point)) {
			return $point;
		}

		$method = wpl_global::get_setting('geocoding_server');
	    if($method == 'google_first')
        {
            $point = wpl_locations::get_LatLng_google($address);
            if(!$point) $point = wpl_locations::get_LatLng_OSM($address);
        }
        else
        {
            $point = wpl_locations::get_LatLng_OSM($address);
            if(!$point) $point = wpl_locations::get_LatLng_google($address);
        }

		do_action('wpl_locations/get_LatLng/after_request', $address, $point);

		if(is_array($point)) {
			return $point;
		}
		return array(0, 0);
	}

    /**
     * Geocoding Using Google Server
     * @author Howard <howard@realtyna.com>
     * @static
     * @param string $address
     * @return array|bool
     */
    public static function get_LatLng_google($address)
    {
        // Encode URL
        $address = urlencode($address);

        $api_key = trim( wpl_global::get_setting('google_serverside_api_key') ?? '' );
        if(!$api_key) $api_key = trim( wpl_global::get_setting('google_api_key') ?? '' );

        // Google Geocoding Server
        $url = "https://maps.googleapis.com/maps/api/geocode/json?address=".$address."&key=".$api_key;

        // Getting Geopoint Using Google
        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER["HTTP_USER_AGENT"]);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);

        $JSON = curl_exec($ch);
        $data = json_decode($JSON ?? '', true);

        $location_point = isset($data['results'][0]) ? $data['results'][0]['geometry']['location'] : NULL;

        if((isset($location_point['lat']) and $location_point['lat']) and (isset($location_point['lng']) and $location_point['lng']))
        {
            curl_close($ch);
            return array($location_point['lat'], $location_point['lng']);
        }

        return false;
    }

    /**
     * Geocoding Using OpenStreetMap Server
     * @author Howard <howard@realtyna.com>
     * @static
     * @param string $address
     * @return array|bool
     */
    public static function get_LatLng_OSM($address)
    {
        // Encode URL
        $address = urlencode($address);

        // OSM Geocoding Server
        $url = "https://nominatim.openstreetmap.org/search?format=json&q=".$address;

        // Getting Geopoint Using OSM Server
        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER["HTTP_USER_AGENT"]);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);

        $JSON = curl_exec($ch);
        $data = json_decode($JSON ?? '', true);

        $place = isset($data[0]) ? $data[0] : array();

        if((isset($place['lat']) and $place['lat']) and (isset($place['lon']) and $place['lon']))
        {
            curl_close($ch);
            return array($place['lat'], $place['lon']);
        }

        return false;
    }

    /**
     * Returns address of proeprty by latitude and longitude
     * @author Howard <howard@realtyna.com>
     * @static
     * @param int $latitude
     * @param int $longitude
     * @return array
     */
	public static function get_address($latitude, $longitude)
	{
        $api_key = trim( wpl_global::get_setting('google_serverside_api_key') ?? ''  );
		if(!$api_key) $api_key = trim( wpl_global::get_setting('google_api_key') ?? '' );

		$url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=".$latitude.",".$longitude."&sensor=false".($api_key ? "&key=".$api_key : "");

		/** getting address **/
		$ch = curl_init();

		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_HEADER, 0); /** Change this to a 1 to return headers **/
		curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER["HTTP_USER_AGENT"]);
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 0);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_TIMEOUT, 10);
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);

		$data = curl_exec($ch);
		curl_close($ch);

		$data = json_decode($data ?? '', true);

		$formatted_locations = $data['results'][0]['address_components'];
		$locations = array();

		foreach($formatted_locations as $formatted_location)
		{
			if(in_array('country', $formatted_location['types'])) $locations['location1'] = $formatted_location['long_name'];
			elseif(in_array('administrative_area_level_1', $formatted_location['types'])) $locations['location2'] = $formatted_location['long_name'];
			elseif(in_array('administrative_area_level_2', $formatted_location['types'])) $locations['location3'] = $formatted_location['long_name'];
		}

		$locations['full_address'] = $data['results'][0]['formatted_address'];

		return $locations;
	}

    /**
     * Updates latitude and longitude of a property
     * @author Howard <howard@realtyna.com>
     * @static
     * @param array $property_data
     * @param int $property_id
     * @return array
     */
    public static function update_LatLng($property_data, $property_id = NULL)
    {
        // Fetch property data if property id is setted
		if($property_id) $property_data = wpl_property::get_property_raw_data($property_id);
        if(!$property_id) $property_id = $property_data['id'];

        $location_text = wpl_property::generate_location_text($property_data);
		$location_text = apply_filters('wpl_locations/update_LatLng/location_text', $location_text, $property_data);
        $LatLng = self::get_LatLng($location_text);

        if($LatLng[0] and $LatLng[1])
        {
            wpl_db::update('wpl_properties', ['googlemap_lt' => $LatLng[0], 'googlemap_ln' => $LatLng[1]], 'id', $property_id);

            // add for APS addon for polygon search
            if (wpl_global::check_addon('aps')) {
                wpl_db::q(wpl_db::prepare("UPDATE `#__wpl_properties` SET geopoints = ST_GeomFromText('POINT(%f %f)') WHERE `id` = %d", $LatLng[1], $LatLng[0], $property_id));
            }
        }

        $latitude = (double) ($LatLng[0] ? $LatLng[0] : $property_data['googlemap_lt']);
        $longitude = (double) ($LatLng[1] ? $LatLng[1] : $property_data['googlemap_ln']);

        return array($latitude, $longitude);
    }

    /**
     * Returns location name by abbreviation
     * @author Howard <howard@realtyna.com>
     * @static
     * @param string $abbr
     * @param int $location_level
     * @return string
     */
    public static function get_location_name_by_abbr($abbr, $location_level = 1)
    {
        // First Validation
        if(!$location_level) $location_level = 1;
        if($location_level == 'zips') return $abbr;

        // Return From Cache
        if(isset(self::$names_by_abbr[$location_level])) return isset(self::$names_by_abbr[$location_level][$abbr]) ? self::$names_by_abbr[$location_level][$abbr] : $abbr;

        // Get All Locations
        $locations = wpl_db::select(wpl_db::prepare("SELECT `abbr`, `name` FROM %i WHERE 1", "#__wpl_location{$location_level}"), 'loadObjectList');

        $names_by_abbr = array();
        $abbr_by_names = array();

        foreach($locations as $location)
        {
            $names_by_abbr[$location->abbr] = $location->name;
            $abbr_by_names[strtolower($location->name)] = $location->abbr;
        }

        // Set to Cache
        self::$names_by_abbr[$location_level] = $names_by_abbr;
        self::$abbrs_by_name[$location_level] = $abbr_by_names;

        // Return
        return ((isset(self::$names_by_abbr[$location_level][$abbr]) and trim( self::$names_by_abbr[$location_level][$abbr] ?? '' ) ) ? self::$names_by_abbr[$location_level][$abbr] : $abbr);
    }

    /**
     * Returns abbreviation by location name
     * @author Howard <howard@realtyna.com>
     * @static
     * @param string $name
     * @param int $location_level
     * @return string
     */
    public static function get_location_abbr_by_name($name, $location_level = 1)
    {
        // First Validation
        if(!$location_level) $location_level = 1;
        if($location_level == 'zips') return $name;

        // Return From Cache
        $key = strtolower($name);
        if(isset(self::$abbrs_by_name[$location_level])) return self::$abbrs_by_name[$location_level][$key] ?? $name;

        // Get All Locations
        $locations = wpl_db::select(wpl_db::prepare('SELECT `abbr`, `name` FROM %i WHERE 1', "#__wpl_location{$location_level}"), 'loadObjectList');

        $names_by_abbr = array();
        $abbr_by_names = array();

        foreach($locations as $location)
        {
            $names_by_abbr[$location->abbr] = $location->name;
            $abbr_by_names[strtolower($location->name)] = $location->abbr;
        }

        // Set to Cache
        self::$abbrs_by_name[$location_level] = $abbr_by_names;
        self::$names_by_abbr[$location_level] = $names_by_abbr;

        // Return
        return ((isset(self::$abbrs_by_name[$location_level][$key]) and trim( self::$abbrs_by_name[$location_level][$key] ?? '' ) ) ? self::$abbrs_by_name[$location_level][$key] : $name);
    }

    /**
     * Returns Location Suffixes and Prefixes
     * @author Howard <howard@realtyna.com>
     * @static
     * @return array
     */
    public static function get_location_suffix_prefix()
    {
        $results = explode(',', trim( wpl_global::get_setting('location_suffix_prefix', 3) ?? '' , ', '));

        $sufpre = array();
        foreach($results as $result) $sufpre[] = trim( $result ?? '' , ', ');

        return $sufpre;
    }

	/**
	 * Create normalized text search based on main keyword abbreviations
	 * @author Noah.S <noah.s@realtyna.com>
	 * @static
	 * @return string
	 */
	public static function createNormalizedSearchText($text)
	{
		if (strlen($text) < 2) {
			return null;
		}

		$text = strtolower(str_replace(',', '', $text));
		$words = explode(' ', $text);

		$abbreviationList = array(
			'street' => 'st',
			'avenue' => 'ave',
			'boulevard' => 'blvd',
			'highway' => 'hwy',
			'lane' => 'ln',
			'square' => 'sq',
			'road' => 'rd',
			'drive' => 'dr',
			'place' => 'pl',
			'crescent' => 'cresc',
			'court' => 'cou',
			'path' => 'pa',
			'gate' => 'gt',
			'terrace' => 'ter'
		);

		foreach($words as &$word) {
			// Remove single character words.
			$word = strlen($word) > 1 ? $word : '';

			// Remove ordinals
			$word = preg_replace('/\\b(\d+)(?:st|nd|rd|th)\\b/', '$1', $word);

			// Convert to abbreviations
			if (in_array($word, array_keys($abbreviationList))) {
				$word = $abbreviationList[$word];
			}
		}
		unset($word);

		return ' ' . implode(' ', array_filter($words)) . ' ';
	}
}