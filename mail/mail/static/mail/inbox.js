document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector("#email-view").style.display = "none";
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Handle the form submition
  document.querySelector("#compose-form").onsubmit = sendEmail
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector("#email-view").style.display = "none";  
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
        const emailDiv = document.createElement("div");
        
        // Give Div id
        emailDiv.id = item.id
        emailDiv.className = "emails-list"
        
        const person = document.createElement("h5");
        
        // Check if mailbox is sender or reciever
        if (mailbox === "sent") {
          person.textContent = `Sent to: ${item.recipients.join(", ")}`  
        } else {
          person.textContent = `From: ${item.sender}`
        }
        
        const reason = document.createElement("p");
        reason.textContent = `Subject: ${item.subject}`
        const date = document.createElement("small");
        date.textContent = `Date: ${item.timestamp}`
        emailDiv.append(person, reason, date)
        document.querySelector("#emails-view").append(emailDiv)

        // Check if mail is read or not
        if (item.read) {
          emailDiv.style.backgroundColor = "gray"

        } else {
          emailDiv.style.backgroundColor = "white"
        }

        // Go to specific mail
        emailDiv.onclick = () => mailView(item.id, mailbox)
      })
    })
  };
}


// Function to send email and data to the server
function sendEmail() {
  // Capture form data when form is submited
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
}


// Function to see a  specific email
function mailView(id, mailbox) {
  // Request JSON for the email id
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // load the email-view div and hide the others
    document.querySelector("#email-view").style.display = "block"
    document.querySelector("#emails-view").style.display = "none"
    
    // Clear the view to avoid duplicates
    document.querySelector("#email-view").innerHTML = ""

    // render mail information
    const mailDiv = document.createElement("div");
    mailDiv.className = "email-content"
    const sender = document.createElement("p");
    sender.textContent = `From: ${email.sender}`
    const recipient = document.createElement("p");
    recipient.textContent = `To: ${email.recipients.join(", ")}`
    const subject = document.createElement("h3");
    subject.textContent = `Subject: ${email.subject}`
    const body = document.createElement("p");
    body.textContent = `Message: ${email.body}`
    const timestamp = document.createElement("small");
    timestamp.textContent = `Date: ${email.timestamp}`

    const archiveButton = document.createElement("button");
    archiveButton.className = "btn btn-sm btn-outline-primary"
    const replyButton = document.createElement("button");
    replyButton.textContent = "Reply"
    replyButton.className = "btn btn-sm btn-outline-primary"

    // Add archive Unarchive button according to mail status
    if (email.archived) {
      archiveButton.textContent = "Unarchive"
    } else {
      archiveButton.textContent = "Archive"
    }

    if (mailbox === "sent") {
      mailDiv.append(subject, sender, recipient, timestamp, body)
      document.querySelector("#email-view").append(mailDiv)
    } else {
      mailDiv.append(subject, sender, recipient, timestamp, body)
      document.querySelector("#email-view").append(archiveButton, mailDiv, replyButton)
    }

    // Mark the mail as read
    fetch(`/emails/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        read: true
      })
    })

    // Send or delete mail from archive
    archiveButton.onclick = () => mailArchive(email.id, email.archived)

    // Reply the mail
    replyButton.onclick = () => reply(email)
  })
} 


// Function to reply messages
function reply(email) {
  // Load the compose view
  document.querySelector("#compose-view").style.display = "block"
  document.querySelector("#emails-view").style.display = "none"
  document.querySelector("#email-view").style.display = "none"

  // Fill the view with email information

  // Check if subject has Re or not
  const subjectWithRe = email.subject.startsWith("Re:")

  document.querySelector("#compose-recipients").value = email.sender
  document.querySelector("#compose-subject").value = (subjectWithRe) ? email.subject : `Re: ${email.subject}`
  document.querySelector("#compose-body").value = `On ${email.timestamp} ${email.sender} wrote: \n\n${email.body}`

  // call send function onsubmit
  document.querySelector("#compose-form").onsubmit = sendEmail
}

// Function to updtade the archived state
function mailArchive(id, archiveState) {
  fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      archived: !archiveState
    })
  })
  .then(() => load_mailbox("inbox"))
}