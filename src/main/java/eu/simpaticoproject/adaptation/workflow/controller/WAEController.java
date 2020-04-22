/*******************************************************************************
 * Copyright 2015 Fondazione Bruno Kessler
 * 
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 * 
 *        http://www.apache.org/licenses/LICENSE-2.0
 * 
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 ******************************************************************************/
package eu.simpaticoproject.adaptation.workflow.controller;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import eu.simpaticoproject.adaptation.common.Utils;
import eu.simpaticoproject.adaptation.text.Handler;
import eu.simpaticoproject.adaptation.workflow.model.DomainModelStore;
import eu.simpaticoproject.adaptation.workflow.model.WorkFlowModelStore;
import eu.simpaticoproject.adaptation.workflow.model.wf.PageModel;
import eu.simpaticoproject.adaptation.workflow.storage.RepositoryManager;
import io.swagger.annotations.ApiOperation;

/**
 * @author raman
 *
 */
@RestController
public class WAEController {
    static Logger logger = Logger.getLogger(Handler.class.getName());

	@Autowired
	private RepositoryManager storage;
	
	@RequestMapping(value = "/wae/model/page", method = RequestMethod.GET)
	@ApiOperation(value = "Find model",
	  notes = "Get a model with the specific URI and profile")
	public @ResponseBody PageModel getPageModel(@RequestParam String uri,
			@RequestParam(required=false) String idProfile,
			HttpServletRequest request) throws Exception {
		//TODO from idProfile to profile type?
		String profileType = idProfile;
		WorkFlowModelStore modelStore = storage.getModelByProfile(uri, profileType);
		if(modelStore != null) {
			if(logger.isInfoEnabled()) {
				logger.info(String.format("getPageModel: %s - %s - %s", uri, idProfile, 
						modelStore.getObjectId()));
			}
			return modelStore.getModel();
		} else {
			throw new Exception("model not found");
		}
	}
	
	@RequestMapping(value = "/wae/model", method = RequestMethod.GET)
	@ApiOperation(value = "Get models",
	  notes = "Get models matching the specific URI")
	public @ResponseBody List<WorkFlowModelStore> getModelStore(@RequestParam String uri,
			HttpServletRequest request) throws Exception {
		List<WorkFlowModelStore> list = storage.getModels(uri);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getModelStore: %s - %s", uri, list.size()));
		}
		return list;
	}

	
	@RequestMapping(value = "/wae/eservice", method = RequestMethod.GET)
	@ApiOperation(value = "Get models by eServiceId",
	  notes = "Get models matching the specific eServiceID")
	public @ResponseBody List<WorkFlowModelStore> getModelStoreByEServiceId(@RequestParam String eServiceId,
			HttpServletRequest request) throws Exception {
		List<WorkFlowModelStore> list = storage.getModelsByESeerviceId(eServiceId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getModelStore for eServiceId: %s - %s", eServiceId, list.size()));
		}
		return list;
	}

	@RequestMapping(value = "/wae/model", method = RequestMethod.POST)
	@ApiOperation(value = "Create model",
	  notes = "Create a new model")
	public @ResponseBody WorkFlowModelStore addModelStore(@RequestBody WorkFlowModelStore model,
			HttpServletRequest request) throws Exception {
		WorkFlowModelStore modelDB = storage.saveModel(model);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("addModelStore: %s - %s - %s", modelDB.getUri(), 
					modelDB.getProfileTypes(), modelDB.getObjectId()));
		}
		return modelDB;
	}
	
	@RequestMapping(value = "/wae/model/{objectId}", method = RequestMethod.PUT)
	@ApiOperation(value = "Update model",
	  notes = "Update an existing model")
	public @ResponseBody WorkFlowModelStore saveModelStore(@PathVariable String objectId, 
			@RequestBody WorkFlowModelStore model,
			HttpServletRequest request) throws Exception {
		model.setObjectId(objectId);
		WorkFlowModelStore modelDB = storage.saveModel(model);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("saveModelStore: %s - %s - %s", modelDB.getUri(), 
					modelDB.getProfileTypes(), modelDB.getObjectId()));
		}
		return modelDB;
	}
	
	@RequestMapping(value = "/wae/model/{objectId}", method = RequestMethod.DELETE)
	@ApiOperation(value = "Delete model",
	  notes = "Delete an existing model")
	public @ResponseBody void deleteModelStore(@PathVariable String objectId,
			HttpServletRequest request) throws Exception {
		storage.deleteModel(objectId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("deleteModelStore: %s", objectId));
		}
	}
	
	@RequestMapping(value = "/wae/model/domain", method = RequestMethod.POST)
	@ApiOperation(value = "Create domain model",
	  notes = "Create a new domain model")
	public @ResponseBody DomainModelStore addDomainModelStore(@RequestBody DomainModelStore model,
			HttpServletRequest request) throws Exception {
		DomainModelStore modelDB = storage.saveDomainModel(model);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("addModelStore: %s - %s", modelDB.getUri(), 
					modelDB.getObjectId()));
		}
		return modelDB;
	}

	
	@RequestMapping(value = "/wae/model/domain", method = RequestMethod.GET)
	@ApiOperation(value = "Find domain model",
	  notes = "Get a domain model with the specific URI and profile")
	public @ResponseBody DomainModelStore getDomainModel(@RequestParam String uri,
			@RequestParam(required=false) String idProfile,
			HttpServletRequest request) throws Exception {
		//TODO from idProfile to profile type?
		String profileType = idProfile;
		DomainModelStore modelStore = storage.getDomainModelByProfile(uri, profileType);
		if(modelStore != null) {
			if(logger.isInfoEnabled()) {
				logger.info(String.format("getDomainModel: %s - %s - %s", uri, idProfile, 
						modelStore.getObjectId()));
			}
			return modelStore;
		} else {
			throw new Exception("model not found");
		}
	}
	
	
	@ExceptionHandler(IllegalArgumentException.class)
	@ResponseStatus(value=HttpStatus.BAD_REQUEST)
	@ResponseBody
	public Map<String,String> handleWrongRequestError(HttpServletRequest request, Exception exception) {
		logger.error(exception.getMessage());
		return Utils.handleError(exception);
	}
	
	@ExceptionHandler(Exception.class)
	@ResponseStatus(value=HttpStatus.INTERNAL_SERVER_ERROR)
	@ResponseBody
	public Map<String,String> handleGenericError(HttpServletRequest request, Exception exception) {
		logger.error(exception.getMessage());
		return Utils.handleError(exception);
	}
}
