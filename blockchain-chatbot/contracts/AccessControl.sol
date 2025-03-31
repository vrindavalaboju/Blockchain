// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AccessControl {
    address public owner;
    
    // Mapping to store restricted topics
    mapping(string => bool) public restrictedTopics;
    
    // Event for logging query validation
    event QueryValidated(address user, string query, bool allowed);
    
    constructor() {
        owner = msg.sender;
        
        // Add initial restricted topics
        restrictedTopics["medication"] = true;
        restrictedTopics["diagnosis"] = true;
        restrictedTopics["treatment"] = true;
    }
    
    // Function to validate if a query contains restricted content
    function validateQuery(string memory query) public returns (bool) {
        // This is a simplistic implementation
        // In a real system, you would need more sophisticated validation
        bool isRestricted = false;
        
        // Logic to check if query contains restricted topics
        // This would be connected to your NLP filter results
        
        emit QueryValidated(msg.sender, query, !isRestricted);
        return !isRestricted;
    }
    
    // Function to add new restricted topics (admin only)
    function addRestrictedTopic(string memory topic) public {
        require(msg.sender == owner, "Only owner can add restricted topics");
        restrictedTopics[topic] = true;
    }
}