<?php
class ManagerAudit extends Manager{
	function create($table_name,$table_id,$data,$data_prev=null,$param_arr=array()){
		$param_arr=array_merge($param_arr,array(
			"is_included_not_changed"=>$param_arr["is_included_not_changed"]??false,
			"key_changed_exclude_arr"=>$param_arr["key_changed_exclude_arr"]??array("last_update"),
		));
		//
		if(!$param_arr["is_included_not_changed"] && !is_empty($data_prev)){
			$data_fx=$data;
			$data_prev_fx=$data_prev;
			//
			foreach($param_arr["key_changed_exclude_arr"] as $key_changed_exclude){
				unset($data_fx[$key_changed_exclude]);
				unset($data_prev_fx[$key_changed_exclude]);
			}
			//
			if($data_fx===$data_prev_fx){
				return;
			}
		}
		//
		$au_arr=array(
			"id_user"=>$this->id_user,
			"table_name"=>$table_name,
			"table_id"=>$table_id,
			"data"=>json_encode($data),
			"data_prev"=>!is_empty($data_prev["id"])?json_encode($data_prev):"###NULL###",
		);
		$this->database->inup("audit",$au_arr,null,true);
	}
}
?>
