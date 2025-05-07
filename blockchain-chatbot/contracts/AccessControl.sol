// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AccessControl {
    address public owner;
    
    // Mapping to store restricted topics
    mapping(string => bool) public restrictedTopics;
    
    // Events for logging
    event QueryValidated(address user, string query, bool allowed);
    event QueryProcessed(string query, string responseHash);
    event TopicRestrictionChanged(string topic, bool isRestricted);
    
    // User roles (0 = regular, 1 = admin, 2 = medical professional)
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
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyAdmin() {
        require(userRoles[msg.sender] >= 1, "Only admins can call this function");
        _;
    }
    
    // Function to validate if a query should be processed
    function validateQuery(string memory query) public returns (bool) {
        // In a real implementation, this would connect to your NLP filter results
        bool isAllowed = true;
        
        // Log the validation result
        emit QueryValidated(msg.sender, query, isAllowed);
        return isAllowed;
    }
    
    // Function to log processed queries and responses
    function logQueryProcessing(string memory query, string memory responseHash) public {
        // This function creates an immutable audit log of interactions
        emit QueryProcessed(query, responseHash);
    }
    
    // Admin functions
    function addRestrictedTopic(string memory topic) public onlyAdmin {
        restrictedTopics[topic] = true;
        emit TopicRestrictionChanged(topic, true);
    }
    
    function removeRestrictedTopic(string memory topic) public onlyAdmin {
        restrictedTopics[topic] = false;
        emit TopicRestrictionChanged(topic, false);
    }
    
    function assignUserRole(address user, uint8 role) public onlyOwner {
        require(role <= 2, "Invalid role");
        userRoles[user] = role;
    }
    // Mapping to track stored IPFS CIDs per user
    mapping(address => string[]) public userCIDs;

    // Event emitted when a user stores a CID
    event CIDStored(address indexed user, string cid);

    // Function to allow users to store an IPFS CID (e.g., chatbot log)
    function storeIPFSCID(string memory cid) public {
        userCIDs[msg.sender].push(cid);
        emit CIDStored(msg.sender, cid);
    }

    // Optional getter (useful in frontend/testing; not strictly required)
    function getUserCIDs(address user) public view returns (string[] memory) {
        return userCIDs[user];
    }

}