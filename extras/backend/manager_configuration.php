<?php
class ManagerConfiguration extends Manager{
	public function getConfigurationArr(){
		$conf_res=$this->database->getItems("configuration");
		//
		$conf_arr=array();
		foreach($conf_res["rows"] as $conf_row){
			$conf_arr[$conf_row["code"]]=$conf_row["value"];
		}
		//
		//TODO - SHARK_CRASH_CUSTOM_OLD
		//
		if(SWNAME==SHARK)		require_once(DOCUMENT_ROOT."/".SHARK."/".SWSIDE."/custom/shark_configuration.php");
		else if(SWNAME==CRASH)		require_once(DOCUMENT_ROOT."/".CRASH."/".SWSIDE."/custom/crash_configuration.php");
		else 				require_once(SWPATH.SWSIDE."/custom/custom_configuration.php");
		//
		if(!is_subclass_of("CustomConfiguration","CrashConfiguration")){
			//
			//SHARK CONFIGURATION
			//
			if(SWNAME==SHARK){
				require_once(DOCUMENT_ROOT."/".SHARK."/".SWSIDE."/custom/shark_configuration.php");
				$custom_configuration=new SharkConfiguration($this->database,$this->def_config,$this->def_manager,$this->custom,$this);
				$conf_arr=array_merge($conf_arr,$custom_configuration->getConfigurationArr());
			}
			//
			//CRASH CONFIGURATION
			//
			if(SWNAME!=SHARK){
				require_once(DOCUMENT_ROOT."/".CRASH."/".SWSIDE."/custom/crash_configuration.php");
				$custom_configuration=new CrashConfiguration($this->database,$conf_arr,$this->def_manager,$this->custom,$this);
				$conf_arr=array_merge($conf_arr,$custom_configuration->getConfigurationArr());
			}
			//
			//PROJECT CONFIGURATION
			//
			if(SWNAME!=SHARK && SWNAME!=CRASH){
				require_once(SWPATH.SWSIDE."/custom/custom_configuration.php");
				$custom_configuration=new CustomConfiguration($this->database,$this,$conf_arr);
				$conf_arr=array_merge($conf_arr,$custom_configuration->getConfigurationArr());
			}
		}
		//
		//VERSIONE NUOVA
		//
		else{
			$custom_configuration=null;
			//
			//SHARK CONFIGURATION
			//
			if(SWNAME==SHARK){
				require_once(DOCUMENT_ROOT."/".SHARK."/".SWSIDE."/custom/shark_configuration.php");
				$custom_configuration=new SharkConfiguration($this->database,$this->def_config,$this->def_manager,$this->custom,$this);
			}
			//
			//CRASH CONFIGURATION
			//
			else if(SWNAME==CRASH){
				require_once(DOCUMENT_ROOT."/".CRASH."/".SWSIDE."/custom/crash_configuration.php");
				$custom_configuration=new CrashConfiguration($this->database,$this->def_config,$this->def_manager,$this->custom,$this);
			}
			//
			//PROJECT CONFIGURATION
			//
			else{
				require_once(SWPATH.SWSIDE."/custom/custom_configuration.php");
				$custom_configuration=new CustomConfiguration($this->database,$this->def_config,$this->def_manager,$this->custom,$this);
			}
			//
			$conf_arr=array_merge($conf_arr,$custom_configuration->getConfigurationArr());
		}
















		/*
		//
		//SHARK CONFIGURATION
		//
		//TODO - MODALITA VECCHIA DA AGGIORNARE
		//
		if(true){
			require_once(DOCUMENT_ROOT."/".SHARK."/".SWSIDE."/custom/shark_configuration.php");
			$shark_configuration=new SharkConfiguration($this->database,$this);
			$conf_arr=array_merge($conf_arr,$shark_configuration->getConfigurationArr());
		}
		//
		//CRASH CONFIGURATION
		//
		if(SWNAME!=SHARK){
			require_once(DOCUMENT_ROOT."/".CRASH."/".SWSIDE."/custom/crash_configuration.php");
			$crash_configuration=new CrashConfiguration($this->database,$this,$conf_arr);
			$conf_arr=array_merge($conf_arr,$crash_configuration->getConfigurationArr());
		}
		//
		//PROJECT CONFIGURATION
		//
		if(SWNAME!=SHARK && SWNAME!=CRASH){
			require_once(SWPATH.SWSIDE."/custom/custom_configuration.php");
			$custom_configuration=new CustomConfiguration($this->database,$this,$conf_arr);
			$conf_arr=array_merge($conf_arr,$custom_configuration->getConfigurationArr());
		}
		*/











		//
		return $conf_arr;
	}
	//
	public function fixConfigurationTableArr($conf_table_arr){
		$conf_arr=array();
		//
		foreach($conf_table_arr as $conf_table){
			$ct_exists_sql=sprintf("	SELECT EXISTS
							(
								SELECT
								1
								
								FROM
								pg_class AS cls
								INNER JOIN pg_namespace AS nsp	ON nsp.oid=cls.relnamespace
								
								WHERE
								nsp.nspname='public'
								AND
								cls.relkind='r'
								AND
								cls.relname='%s'
							)::int AS table_exists
							",
							$conf_table
							);
			$ct_exists_res=$this->database->getRows($ct_exists_sql);
			//
			if($ct_exists_res["count"]>0 && (int)$ct_exists_res["rows"]["0"]["table_exists"]==1){
				$ct_sql=sprintf("	SELECT
							ct.*
							
							FROM
							%s AS ct
							
							ORDER BY
							ct.id ASC
							",
							$conf_table
							);
				$ct_res=$this->database->getRows($ct_sql);
				//
				$conf_arr[$conf_table."_arr"]=$this->fixConfigurationArr($ct_res["rows"]);
			}
		}
		//
		return $conf_arr;
	}
	//
	public function fixConfigurationArr($c_rows){
		$ret_arr=array();
		//
		if(!is_empty($c_rows)){
			foreach($c_rows as $c_row){
				$ret_arr[$c_row["code"]]=$c_row;
			}
		}
		//
		return $ret_arr;
	}
}
?>
