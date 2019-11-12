package com.giraone.pms.web.rest;

import com.giraone.pms.security.AuthoritiesConstants;
import com.giraone.pms.security.SecurityUtils;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * REST controller for public API to check authentication
 */
@RestController
@RequestMapping("/trusted-api")
public class PingApiResource {

    private final Logger log = LoggerFactory.getLogger(PingApiResource.class);

    /**
     * GET  /trusted-api/ping : ping method to check, whether authentication works
     *
     * @return the ResponseEntity with status 200 (OK) and { "status"; "OK" } as body data or 403 (FORBIDDEN)
     */
    @GetMapping("/ping")
    @ApiOperation(
        value = "Check whether authentication and authorization works.",
        notes = "Returns a status object in the body."
    )
    @ApiResponses(value = {
        @ApiResponse(code = 200, message = "When login and authorization was OK."),
        @ApiResponse(code = 401, message = "When the login failed."),
        @ApiResponse(code = 403, message = "When the login was OK, but authorization to use the API was not granted."),
    })
    public ResponseEntity<Map<String, String>> getPingStatus() {

        Optional<String> login = SecurityUtils.getCurrentUserLogin();
        boolean isTrustedSystem = SecurityUtils.isCurrentUserInRole(AuthoritiesConstants.TRUSTEDSYSTEM);
        log.info("REST ping request login={}, isTrustedSystem={}", login, isTrustedSystem);
        if (isTrustedSystem) {
            HashMap<String, String> ret = new HashMap<>();
            ret.put("status", "OK");
            return ResponseEntity.ok(ret);
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
}

