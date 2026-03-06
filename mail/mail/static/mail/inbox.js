document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  // Load functions
  sentEmail()
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';  
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Render mailbox emails
  renderEmails(mailbox)

  function renderEmails(mailbox) {
    // Fetch the API for the emails
    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(data => {
      data.forEach(item => {
        // Create the corresponding html content for each mail
        const emailDiv = document.createElement("div")
        
        // Give Div id
        emailDiv.id = "email-content"
        
        const person = document.createElement("h5")
        
        // Check if mailbox is sender or reciever
        if (mailbox === "sent") {
          person.textContent = item.recipients.join(", ")  
        } else {
          person.textContent = item.sender
        }
        
        const reason = document.createElement("p")
        reason.textContent = item.subject
        const date = document.createElement("small")
        date.textContent = item.timestamp
        emailDiv.append(person, reason, date)
        document.querySelector("#emails-view").append(emailDiv)

        // Check if mail is read or not
        if (item.read) {
          emailDiv.style.backgroundColor = "gray"

        } else {
          emailDiv.style.backgroundColor = "white"
        }

        // Click the email
      })
    })
  };

}


// Function to send email and data to the server
function sentEmail() {
  // Capture form data when form is submited
  document.querySelector("#compose-form").onsubmit = () => {
    const sendTo = document.querySelector("#compose-recipients").value;
    const subject = document.querySelector("#compose-subject").value;
    const body = document.querySelector("#compose-body").value;

    // Create JSON email
    fetch("/emails", {
      method: "POST",
      body: JSON.stringify({
        recipients: sendTo,
        subject: subject,
        body: body,
      })
    })

    // Send the data to the database
    .then(response => response.json())
    .then(result => {

      // Send alert in case of error
      if (result.error) {
        alert(result.error)
        // Load compose it fails
        compose_email()
      } else {
        alert(result.message)
        // Load sent view once is sent
        load_mailbox("sent")
      }
    });

    // Avoid reloading the page
    return false;
  };
}
