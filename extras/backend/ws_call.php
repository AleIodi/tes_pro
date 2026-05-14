<?php
$def_is_system=true;
require_once("../modules/config.inc.php");
require_once(DOCUMENT_ROOT."/".SHARK."/backend/classes/manager_ws.php");
//
$def_manager_ws_server=new ManagerWS_Server($database,$def_manager,$def_config,$custom);
//
if(!is_empty($def_config["ws_config_json"])){
	$ws_config_arr=json_decode($def_config["ws_config_json"],true);
	//
	$def_manager_ws_server->doMethod($ws_config_arr,$_REQUEST);
}
else{
	$def_manager_ws_server->sendResultError("WS_ERROR_WS_CONFIG_NOT_VALID");
}
?>
