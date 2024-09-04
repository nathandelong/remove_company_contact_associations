//Language: Node.js 20.x
//Property to include in code: companyID = Record ID

const axios = require('axios');

exports.main = async (event, callback) => {
  const companyID = event.inputFields['companyID'];
  const ACCESS_TOKEN = process.env.hstoken;  // Ensure you set this in your environment variables

  try {
    // Step 1: Retrieve contacts associated with the companyID
    const contactsResponse = await axios.get(`https://api.hubapi.com/crm/v4/objects/companies/${companyID}/associations/contacts`, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const contacts = contactsResponse.data.results;

    if (!contacts || contacts.length === 0) {
      console.log('No contacts found for the company.');
      callback({
        outputFields: {
          status: 'No contacts to remove'
        }
      });
      return;
    }

    // Step 2: Remove associations between each contact and the companyID
    for (const contact of contacts) {
      const contactId = contact.toObjectId;
      if (!contactId) {
        console.error('Contact ID is undefined');
        continue;
      }

      try {
        await axios.delete(`https://api.hubapi.com/crm/v4/objects/companies/${companyID}/associations/contacts/${contactId}`, {
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        console.log(`Removed association for contact ID: ${contactId}`);
      } catch (deleteError) {
        console.error(`Error removing association for contact ID: ${contactId}`, deleteError.response ? deleteError.response.data : deleteError.message);
      }
    }

    callback({
      outputFields: {
        status: 'Associations removed successfully'
      }
    });

  } catch (error) {
    console.error('Error retrieving contacts:', error.response ? error.response.data : error.message);

    callback({
      outputFields: {
        status: 'Error retrieving contacts'
      }
    });
  }
};
