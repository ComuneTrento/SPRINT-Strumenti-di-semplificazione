
// Citizen Data Vault User Interface (cdv-ui-popup.js)
//-----------------------------------------------------------------------------
// This JavaScript contains the functionality related to the User Interface
// which enriches the Interactive Front-End component with the features of
// the CDV component.
// - It uses the methods implemented in cdv-core-popup.js
// - The Citizenpedia server side code is available in:
//              https://github.com/SIMPATICOProject/CDV
//-----------------------------------------------------------------------------

var cdvUI = (function () {
	var instance; // Singleton Instance of the UI component
	var featureEnabled = false;

	function Singleton() {

		var colors = {
			cdv: '#008000'
		}

		var originalCSS = null;

		var labels = {
			dialogTitle: 'Citizen Data Vault',
			tabPFieldsTitle: 'Personal Data Fields',
			entryMessage: 'Welcome to SIMPATICO Citizen Data Vault!',
			statusMessage: 'Now you can select/update your personal data to fill form fields.',
			notextMessage: 'No field selected',
			dialogSaveTitle: 'Data Saved',
			dialogSaveMessage: 'Data saved successfully into your Data Vault.',
			statusMessageNoAccount: "No CDV Account associated to you. Create?",
			statusMessageNoActive: "CDV is not active for this service. Activate?",
			tabSettingsTitle: 'Settings',
			buttonSave: 'Save your data',
			labelAccount : 'CDV Account',
			buttonRemoveAccount: 'Remove account',
			buttonActivateCDV: 'Activate CDV',
			labelExport : 'Export',
			buttonExport: 'Export your data',
			buttonActivate: 'Activate account',
			msgConfirmRemove: '<p> Are you sure to remove your account?</p><p>Your data will be permanently deleted and cannot be recovered. Remember to save your data first.</p><p>' + 'Press \'OK\' to continue...</p>',
			dialogRemoveTitle: 'Remove account',
			buttonOK : 'OK',
			buttonCANCEL: 'Cancel'
		};

		var dataFields = [];

		/**
		 * CURRENTLY SELECTED FIELD
		 */
		var selectedField = null;

		var dialog_cdv = null;

		/**
		 * INITIALIZE UI COMPONENT.
		 * CONFIG PARAMETERS:

		 */
		function initComponent(parameters) {

			if (parameters.dataFields) {
				dataFields = parameters.dataFields;
			}

			cdvCORE.getInstance().init({
				endpoint: parameters.endpoint,
				serviceID: parameters.serviceID,
				dataFields: parameters.dataFields,
				serviceURL: parameters.serviceURL,
				cdvDashUrl: parameters.cdvDashUrl
			});

			labels.dialogTitle = parameters.dialogTitle || labels.dialogTitle;
			labels.tabPFieldsTitle = parameters.tabPFieldsTitle || labels.tabPFieldsTitle;
			labels.entryMessage = parameters.entryMessage || labels.entryMessage;
			labels.notextMessage = parameters.notextMessage || labels.notextMessage;
			labels.statusMessage = parameters.statusMessage || labels.statusMessage;
            labels.dialogSaveTitle = parameters.dialogSaveTitle || labels.dialogSaveTitle;
			labels.dialogSaveMessage = parameters.dialogSaveMessage || labels.dialogSaveMessage;
            labels.statusMessageNoAccount = parameters.statusMessageNoAccount || labels.statusMessageNoAccount;
            labels.statusMessageNoActive = parameters.statusMessageNoActive || labels.statusMessageNoActive;
			labels.tabSettingsTitle = parameters.tabSettingsTitle || labels.tabSettingsTitle;

			labels.buttonSave = parameters.buttonSave || labels.buttonSave;
			labels.buttonRemoveAccount = parameters.buttonRemoveAccount || labels.buttonRemoveAccount;
			labels.buttonExport = parameters.buttonExport || labels.buttonExport;
			labels.buttonActivate = parameters.buttonActivate || labels.buttonActivate;
			labels.buttonActivateCDV = parameters.buttonActivateCDV || labels.buttonActivateCDV;
			labels.msgConfirmRemove = parameters.msgConfirmRemove || labels.msgConfirmRemove;
			labels.dialogRemoveTitle = parameters.dialogRemoveTitle || labels.dialogRemoveTitle;
			labels.buttonOK = parameters.buttonOK || labels.buttonOK;
			labels.buttonCANCEL = parameters.buttonCANCEL || labels.buttonCANCEL;
			labels.labelAccount = parameters.labelAccount || labels.labelAccount;
			labels.labelExport = parameters.labelExport || labels.labelExport;

          colors.cdv = parameters.cdvColor || colors.cdv;

		}

		/**
		 * OPEN CDV UI DIALOG
		 */
		function enableComponentFeatures() {
			if (featureEnabled)
				return;
			featureEnabled = true;
			console.log(">>>>initializing CDV Dialog Box");

			if (!dialog_cdv) {
				var inizialize = initializeAccount();
				cdvCORE.getInstance().initializeAccount(inizialize);
				console.log("<<<<initializing CDV Dialog Box");
				
			} else {

				dialog_cdv.dialog("open");
				

			}
			highlightFields(dataFields, true);
		}

		function disableComponentFeatures() {
			if (!featureEnabled)
				return;
			featureEnabled = false;
			selectedField = null;
			highlightFields(dataFields, false);
			$('#plist').remove();
			if (dialog_cdv) {
				dialog_cdv.dialog("destroy");
				dialog_cdv=null;
			}

		}

		function setError(target) {
			var targetElement = document.getElementById(target);
			return function (text) {
				targetElement.innerHTML = '<p>' + text + '</p>';
			}
		}

		function confirmUpdateData() {
			return function (saved) {

				console.log("saved__:" + saved);
				var errCb = setError("tab-pdata");
				if (saved) {
					var dlgData = {
							modal: true,
							buttons: {}
					};
					dlgData.buttons[labels.buttonOK] = function () {
							//cdvCORE.getInstance().cdv_getdata(cdvUI.selectedField, "tab-pdata", errCb);
							var getPDataList = updatePDataFields(cdvUI.selectedField, "tab-pdata");
							cdvCORE.getInstance().cdv_getdata(getPDataList, errCb);
							$(this).dialog("close");
							//dialog_saved.dialog("open");
						};
					var dialog_saved = $(
							'<div id="dialog-message" title="' + labels.dialogSaveTitle + '">' +
							'			<p>' + labels.dialogSaveMessage + '</p>' +
							'</div>').dialog(dlgData);
					
					dialog_saved.dialog("open");
				}
			}

		}
		
		function confirmRemoveAccount(){

			var dlgData = {modal: true,
					buttons: {}
			};
			dlgData.buttons[labels.buttonOK] = function () {
				
				cdvCORE.getInstance().removeCDV();
				cdvUI.getInstance().disable();
				$('#dialog_cdv').dialog("destroy");
				$('#dialog_cdv').dialog("open");
				
				$(this).dialog("close");
				
				
			};
			dlgData.buttons[labels.buttonCANCEL] = function () {
				$(this).dialog("close");
			};
			var dialog_saved = $(
					'<div id="dialog-message" title="' + labels.dialogRemoveTitle + '">' +
					labels.msgConfirmRemove +
					'</div>').dialog(dlgData);
			dialog_saved.dialog("open");

		}

		function initializeAccount() {
			return function (account_exist) {
				console.log("Account " + account_exist);
				if (account_exist) {
					var initializeDlg = initializeDialog();
					cdvCORE.getInstance().initializeSLR(initializeDlg);
				} else {
					var initializeDlg = initializeDialog();
					initializeDlg(false, false);
				}
			}
		}

		function updatePDataFields(source, target) {
			return function (json) {
				var fieldSelect1 = "<fieldset><legend>Selected field </legend>";
				var fieldSelect2 = "<fieldset><legend>Other available fields</legend>";

				 // code for the creation of datalist to anchor to each data input
				var p = $('#plist');
				if (p) {
					console.log("p");
					p.remove();
				}
				var datalisttemp = '<div id="plist">';
				for (itemName in json.properties) {
					property = json.properties[itemName];
					var propertyField= property.key;
					propertyField=propertyField.replace( /(:|\.|\[|\]|,|=|@)/g, "\\$1" );	
					
					datalisttemp += '<datalist id="datalist' + property.key + '">';
					datalisttemp +='<select id='+property.key+' style="display: none;">';

					for (field in property.values) {
						datalisttemp += '<option>' + property.values[field] + '</option>';
					}
					datalisttemp += '</select></datalist>';
					$('#' +propertyField).attr("list", "datalist" + property.key);
					$('#' + property.key).change(function(evt){
						logCORE.getInstance().cdvLogger.useData(simpaticoEservice, evt.currentTarget.id);
					});
					console.log(datalisttemp);
					if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
						 $('#' +propertyField).autocomplete({
							 source: property.values,
							 minLength: 0,
							 change:function(evt) {
									logCORE.getInstance().cdvLogger.useData(simpaticoEservice, evt.currentTarget.id);
							 }}).focus(function () {
							 $(this).autocomplete("search");
						 });
					}
				}
				$(document.body).append(datalisttemp + '</div>');

				
				/*for (itemName in json.properties) {
					property = json.properties[itemName];
					var fieldSelectTemp='';
					var propertyField= property.key;
					propertyField=propertyField.replace( /(:|\.|\[|\]|,|=|@)/g, "\\\\$1" );
					console.log(propertyField);
					if ($('#' + propertyField).attr("label")){
						fieldSelectTemp = '<label class="Labeltabella">' + $('#' + propertyField).attr("label") + '</label>';
					
					} else{
						
						fieldSelectTemp = $('label[for="' + property.key + '"]').html();
					}
					
					fieldSelectTemp += '<p><select onchange="setFieldValue(\'' + propertyField + '\',$(this).val())">';
					fieldSelectTemp += '<option value="">--------</option>';
					for (field in property.values) {
						fieldSelectTemp += '<option value=\'' + property.values[field] + '\'>' + property.values[field] + '</option>';
						
					}
					fieldSelectTemp += '</select></p>';
					if (property.key == $(source).attr("id")) {
						fieldSelect1 += fieldSelectTemp;
					} else {
						fieldSelect2 += fieldSelectTemp;
					}
					
				}
				document.getElementById(target).innerHTML = fieldSelect1 + "</fieldset>";
				document.getElementById(target).innerHTML += fieldSelect2 + "</fieldset>";*/

			}

		}
		
		
		function createTabSetting(target) {
			//return function (json) {
				
				
				var fieldSelect1 = "<fieldset><legend>"+labels.labelAccount+"</legend>";
			    fieldSelect1 += ' <button class="ui-button ui-widget ui-corner-all" onClick="cdvUI.getInstance().confirmRemoveAccount();">'+labels.buttonRemoveAccount+'</button>';
				var fieldSelect2 = "<fieldset><legend>"+labels.labelExport+"</legend>";
				fieldSelect2 += ' <button on-click class="ui-button ui-widget ui-corner-all" onClick="cdvCORE.getInstance().exportData();">'+labels.buttonExport+'</button>';

//				var fieldSelect3 = "<fieldset><legend>Data and Permissions</legend>";
//				fieldSelect3 += ' <button class="ui-button ui-widget ui-corner-all" onClick="openCDV()">Manage your Data</button>';

				
				
				document.getElementById(target).innerHTML = fieldSelect1 + "</fieldset><br>";
//				document.getElementById(target).innerHTML += fieldSelect2 + "</fieldset><br>";
				document.getElementById(target).innerHTML += fieldSelect2 + "</fieldset>";
//				document.getElementById(target).innerHTML += fieldSelect3 + "</fieldset>";

			//}

		}
		
		

		function initializeDialog() {

			return function (account_exist, activated) {
				statusMessage = labels.statusMessage;
				entryMessage = labels.entryMessage;

				console.log("Initialize dialog: " + account_exist + "-" + activated);

				if (!account_exist) {
					statusMessage = '<img src="./img/alert.png" width="40" height="40" <span class="ui-icon ui-icon-alert">  ' + labels.statusMessageNoAccount;
					entryMessage = "";
				} else if (!activated) {
					statusMessage = '<img src="./img/alert.png" width="40" height="40" align="bottom">  ' + labels.statusMessageNoActive;
					entryMessage = "";
				}
				dialog_cdv = $(
						'<div id="dialog-cdv" title="' + labels.dialogTitle + '">' +
						'	<div id="tabs">' +
						'		<ul>' +
						'			<li><a href="#tab-0">Simpatico</a></li>' +
						'			<li><a href="#tab-setting">' + labels.tabSettingsTitle + '</a></li>' +
						'		</ul>' +
						'		<div id="tab-0">' +
						'			<p>' + entryMessage + '</p>' +
						'			<br>' +
						'			<p>' + statusMessage + '</p>' +
						'		</div>' +
						'		<div id="tab-setting">' +
						'			<p>Loading...</p>' +
						'		</div>' +
						'	</div>' +
						'</div>').dialog({
						autoOpen: false,
						modal: false,
						closeOnEscape: false,
						resizable: true,
						height: "auto",
						position: {
							my: "right top",
							at: "right bottom",
							of: "#simp-bar"
						},
						width: 600,
						
						open: function(){
                                var errCb = setError("tab-0");
				                var getPDataList = updatePDataFields(null, null);
				                cdvCORE.getInstance().cdv_getdata(getPDataList, null);
				    			logCORE.getInstance().startActivity('cdv', 'compile');
                        }, close: function(){
                        	featureEnabled = false;
                			logCORE.getInstance().endActivity('cdv', 'compile');
                        }

					});

				if (!account_exist) {
					var dlgData = {
							buttons: {}

						}
					dlgData.buttons[labels.buttonActivate] = function () {
						var confirm = activateSLR();
						cdvCORE.getInstance().createAccount(confirm);
						dialog_cdv.dialog("destroy");
					};

					dialog_cdv.dialog(dlgData);

				} else if (!activated) {
					var dlgData = {
							buttons: {}

					}
					dlgData.buttons[labels.buttonActivateCDV] = function () {
						var activate = activateSLR();
						activate(true);
						dialog_cdv.dialog("destroy");
					};

					dialog_cdv.dialog(dlgData);

				} else {
					var dlgData = {
							buttons: {}
					}
					dlgData.buttons[labels.buttonSave] = function () {
						var confirm = confirmUpdateData();
						cdvCORE.getInstance().cdv_postdata(confirm);
					};
					dialog_cdv.dialog(dlgData);
				}

				dialog_cdv.tabs({
					beforeActivate: function (event, ui) {

						var errCb = setError(ui.newPanel["0"].id);

						if (ui.newPanel["0"].id == "tab-pdata") {
							/*ui.newPanel["0"].innerHTML = '<p>Loading...</p>';
							var getPDataList = updatePDataFields(cdvUI.selectedField, ui.newPanel["0"].id);
							cdvCORE.getInstance().cdv_getdata(getPDataList, errCb);*/
						}
						
						if (ui.newPanel["0"].id == "tab-setting") {
							ui.newPanel["0"].innerHTML = '<p>Loading...</p>';
							//var getPDataList = createTabSetting(ui.newPanel["0"].id);
							//cdvCORE.getInstance().cdv_getdata(getPDataList, errCb);
							createTabSetting(ui.newPanel["0"].id);
						}
						
					},
					load: function (event, ui) {
						/* After page load*/
						

					}
				});

				$("input[type!='submit']").on("click", function () {
					console.log("<<<selected field: " + $(this).attr("id"));
					/*if ($.inArray($(this).attr("id"), dataFields) != -1) {
						console.log("selected field: " + $(this).attr("id"));
						cdvUI.selectedField = $(this);
						var errCb = setError("tab-pdata");
						var getPDataList = updatePDataFields(cdvUI.selectedField, "tab-pdata");
						cdvCORE.getInstance().cdv_getdata(getPDataList, errCb);
					}*/

				});

				$("input[type='submit']").on("click", function () {
					console.log("selected submit: " + $(this).attr("id"));
//					var r = confirm("Update your Personal Data?");
//					if (r == true) {
//						cdvCORE.cdv_send();
//					}
				});

				dialog_cdv.tabs("option", "active", 0);
				dialog_cdv.tabs("option", "disabled", [1,2]);
				if (account_exist && activated) {
					dialog_cdv.tabs("option", "disabled", []);
				}
				dialog_cdv.dialog("open");

			}

		}

		function activateSLR() {
			return function (created) {

				if (created) {
					//dialog_cdv.dialog("destroy");
					var initializeDlg = initializeDialog();
					cdvCORE.getInstance().createSLR(initializeDlg);

				} else {
					var initializeDlg = initializeDialog();
					initializeDlg(false, false);
				}
			}
		}

		function reloadDialog() {
			return function (created) {
				console.log("reload " + created);
				if (created) {
					dialog_cdv.dialog("destroy");
					dialog_cdv.dialog("open");
				}
			}
		}

		function confirmActivation(title, message) {

			var dialog_saved = $(
					'<div id="dialog-message" title="' + title + '">' +
					'			<p>' + message + '</p>' +
					'</div>').dialog({
					modal: true,
					buttons: {
						Ok: function () {
							$(this).dialog("close");
							dialog_cdv.dialog("open");
						}
					}
				});
			dialog_saved.dialog("open");

		}
		
		
		

		function highlightFields(fields, selected) {
			var n = fields.length;
			console.log("#"+n);
			var field="";
			for (var i = 0; i < n; i++) {
				field = fields[i].replace( /(:|\.|\[|\]|,|=|@)/g, "\\$1" );
                 console.log("#"+field+$('#'+field).html());
				if (selected) {
					originalCSS = $('#' + field).css('border');

					$('#' + field).css({
						'border': '2px solid ' + colors.cdv
					});

				} else if (originalCSS) {

					$('#' + field).css({
						'border': originalCSS
					});

				}

			}

		}

		return {
			// Public definitions
			init: initComponent, // Called only one time
			enable: enableComponentFeatures, // Called when the Component button is enabled
			disable: disableComponentFeatures, // Called when the Component button is disabled or another one enabled
			isEnabled: function () {
				return featureEnabled;
			}, // Returns if the feature is enabled
			confirmRemoveAccount: confirmRemoveAccount
			//paragraphEvent: paragraphEvent
		};
	}

	return {
		getInstance: function () {
			if (!instance)
				instance = Singleton();
			return instance;
		}
	};
})();

