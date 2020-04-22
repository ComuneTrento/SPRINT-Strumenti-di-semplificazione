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
package eu.simpaticoproject.adaptation.text.controllers;

import javax.naming.OperationNotSupportedException;
import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import eu.simpaticoproject.adaptation.text.Handler;
import eu.simpaticoproject.adaptation.text.model.PageTextModel;
import eu.simpaticoproject.adaptation.text.repositories.TextModelRepository;
import eu.simpaticoproject.adaptation.text.tae.SimpaticoInput;
import eu.simpaticoproject.adaptation.text.tae.SimpaticoOutput;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;

/**
 * @author raman
 */
@RestController
public class TAEController {

	@Autowired
	private Handler handler;
	@Autowired
	private TextModelRepository repo;
	
//    @RequestMapping(value = "/tae/simp", method = RequestMethod.GET, produces = "application/json")
//    @ApiOperation(value = "Process text",
//            response = SimpaticoOutput.class,
//            notes = "Obtain annotations and simplifications. Two modalities supported: word simplification and sentence/paragraph simplification.")
//    public @ResponseBody String simp(
//            @ApiParam(value = "word to be simplified, if any", required = false) @RequestParam(required = false) String word,
//            @ApiParam(value = "word position in the context, in case of word simplification", required = false) @RequestParam(required = false) Integer position,
//            @ApiParam(value = "language, as 2-letter ISO code. If not specified, derived by the tool", required = false) @RequestParam(required = false) String lang,
//            @ApiParam(value = "sentext or text to be simplified in case of syntactic simplification. Word context in case of word simplification", required = false) @RequestParam(required = false) String text)
//            throws Exception {
//        if (text == null) {
//            text = word;
//        }
//        String json = handler.service(word, position, lang, text);
//        return json;
//    }

    @RequestMapping(value = {"/tae/simpform", "/tae/simp"}, method = RequestMethod.GET, produces = "application/json")
    @ApiOperation(value = "Process text",
            response = SimpaticoOutput.class,
            notes = "Obtain text annotations and simplifications, used for the web demo")
    public @ResponseBody String simpformGet(
            @ApiParam(value = "word to be simplified, if any", required = false) @RequestParam(required = false) String word,
            @ApiParam(value = "word position in the context, in case of word simplification", required = false) @RequestParam(required = false) Integer position,
            @ApiParam(value = "language, as 2-letter ISO code. If not specified, derived by the tool", required = false) @RequestParam(required = false) String lang,
            @ApiParam(value = "text to be simplified in case of syntactic simplification. Word context in case of word simplification", required = false)
            @RequestParam(required = false) String text) throws Exception {
        if (text == null) {
            text = word;
        }
        String json = handler.service(word, position, lang, text);
        return json;
    }

    @RequestMapping(value = "/tae/simp", method = RequestMethod.POST, produces = "application/json")
    @ApiOperation(value = "Process text",
            response = SimpaticoOutput.class,
            notes = "Obtain text annotations and simplifications")
    public @ResponseBody String simp(@RequestBody SimpaticoInput input) throws Exception {
        if (input.getText() == null) {
            input.setText(input.getWord());
        }
        String json = handler.service(input.getWord(), input.getPosition(), input.getLang(), input.getText());
        return json;
    }

    // Request for the web demo
    @RequestMapping(value = "/tae/simpform", method = RequestMethod.POST, produces = "application/json", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    @ApiOperation(value = "Process text",
            response = SimpaticoOutput.class,
            notes = "Obtain text annotations and simplifications, used for the web demo")
    public @ResponseBody String simpform(
            @ApiParam(value = "word to be simplified, if any", required = false) @RequestParam(required = false) String word,
            @ApiParam(value = "word position in the context, in case of word simplification", required = false) @RequestParam(required = false) Integer position,
            @ApiParam(value = "language, as 2-letter ISO code. If not specified, derived by the tool", required = false) @RequestParam(required = false) String lang,
            @ApiParam(value = "text to be simplified in case of syntactic simplification. Word context in case of word simplification", required = false)
            @RequestParam(required = false) String text) throws Exception {
        String json = handler.service(word, position, lang, text);
        return json;
    }

    @RequestMapping(value = "/tae/syntsimp", method = RequestMethod.POST, produces = "application/json", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    @ApiOperation(value = "Process text",
            response = SimpaticoOutput.class,
            notes = "Perform syntactic simplification")
    public @ResponseBody String syntsimp(
            @ApiParam(value = "set to true to use the complexity checker", required = false) @RequestParam(required = false) String comp,
            @ApiParam(value = "set to true to use the confidence model", required = false) @RequestParam(required = false) String conf,
            @ApiParam(value = "language, as 2-letter ISO code. If not specified, derived by the tool", required = false) @RequestParam(required = false) String lang,
            @ApiParam(value = "text to be simplified", required = false) @RequestParam(required = false) String text) throws Exception {
        String json = handler.syntsimp(text, lang, comp, conf);
        return json;
    }

    @RequestMapping(value = "/tae/model", method = RequestMethod.POST, produces = "application/json")
	@ApiOperation(value = "Create text model",
	  response = PageTextModel.class,
	  notes = "Create text model for a specific page")
	public @ResponseBody PageTextModel createModel(@RequestBody PageTextModel input) throws Exception {
		if (repo.findByPageId(input.getPageId()) != null) throw new IllegalArgumentException("Model with the specified pageId already exists");
		return repo.save(input);
	}
	
	@RequestMapping(value = "/tae/model", method = RequestMethod.PUT, produces = "application/json")
	@ApiOperation(value = "Create text model",
	  response = PageTextModel.class,
	  notes = "Update text model for a specific page")
	public @ResponseBody PageTextModel updateModel(@RequestBody PageTextModel input) throws Exception {
		return repo.save(input);
	}

	@RequestMapping(value = "/tae/model", method = RequestMethod.GET, produces = "application/json")
	@ApiOperation(value = "Get text model",
	  response = PageTextModel.class,
	  notes = "Retrieve text model for a specific page")
	public @ResponseBody PageTextModel getModel(@RequestParam String pageId) throws Exception {
		PageTextModel mdl = repo.findByPageId(pageId);
		if (mdl == null) throw new Exception("Model not found");
		return mdl;
	}

	@ExceptionHandler(OperationNotSupportedException.class)
	@ResponseStatus(HttpStatus.NOT_IMPLEMENTED)
	@ResponseBody
	public String handleNotSupportedError(HttpServletRequest request, Exception exception) {
		exception.printStackTrace();
		return "{\"error\":\"" + exception.getMessage() + "\"}";
	}
	
	
	@ExceptionHandler(Exception.class)
	@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
	@ResponseBody
	public String handleError(HttpServletRequest request, Exception exception) {
		exception.printStackTrace();
		return "{\"error\":\"" + exception.getMessage() + "\"}";
	}
}
