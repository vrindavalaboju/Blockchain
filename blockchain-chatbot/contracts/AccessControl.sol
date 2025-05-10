// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AccessControl {
    address public owner;
    
    
    mapping(string => bool) public restrictedTopics;
    
    // Events for logging
    event QueryVal(address user, string query, bool allowed);
    event QueryProc(string query, string responseHash);
    event RestrictionChanged(string topic, bool isRestricted);
    
    
    mapping(address => uint8) public userRoles;
    
    constructor() {
        owner = msg.sender;
        userRoles[msg.sender] = 1; // Owner is admin
        
        // Add initial restricted topics
        restrictedTopics["medication"] = true;
        restrictedTopics["diagnosis"] = true;
        restrictedTopics["patient"] = true;
        restrictedTopics["treatment"] = true;
        restrictedTopics["medical"] = true;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owners");
        _;
    }
    
    modifier onlyAdmin() {
        require(userRoles[msg.sender] >= 1, "Only admins");
        _;
    }
    
    // Function to validate query
    function validateQuery(string memory query) public returns (bool) {
        bool isAllowed = true;
        
        // Log the validation result
        emit QueryVal(msg.sender, query, isAllowed);
        return isAllowed;
    }
    
    // Function to log processed queries and responses
    function logQueryProcessing(string memory query, string memory responseHash) public {
        emit QueryProc(query, responseHash);
    }
    
    // Admin functions
    function addRestricted(string memory topic) public onlyAdmin {
        restrictedTopics[topic] = true;
        emit RestrictionChanged(topic, true);
    }
    
    function removeRestricted(string memory topic) public onlyAdmin {
        restrictedTopics[topic] = false;
        emit RestrictionChanged(topic, false);
    }
    
    function assignUser(address user, uint8 role) public onlyOwner {
        require(role <= 2, "Invalid role");
        userRoles[user] = role;
    }
    // Mapping to track stored IPFS CIDs per user
    mapping(address => string[]) public userCIDs;

    // Event emitted when stores a CID
    event StoreCID(address indexed user, string cid);

    //  store an IPFS CID 
    function storeIPFSCID(string memory cid) public {
        userCIDs[msg.sender].push(cid);
        emit StoreCID(msg.sender, cid);
    }

    function getUserCIDs(address user) public view returns (string[] memory) {
        return userCIDs[user];
    }

}