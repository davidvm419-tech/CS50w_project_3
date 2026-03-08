# CS50W Project 3: Mail

This is my implementation of CS50W’s Project 3: Mail.  
The application is a Single Page Application (SPA) that allows users to send emails, browse their mailboxes, read messages, reply, and archive or unarchive emails.

---

## Features

### 1. Send Email
Users can compose a new email and send it to any registered user.  
The message is stored in the backend database and appears in the **Sent** mailbox.

### 2. Mailbox View
Users can view their **Inbox**, **Sent**, and **Archived** mailboxes.  
Unread emails appear with a **white background**, while read emails appear with a **gray background**.  
Clicking an email loads a detailed view of that message.

### 3. View Email
Displays the full content of the message, including sender, recipients, subject, timestamp, and body.  
This view also includes **Archive/Unarchive** and **Reply** buttons.

### 4. Archive and Unarchive
Users can archive any email from the detailed view.  
Archived emails appear in the **Archive** mailbox, where they can be unarchived and returned to the Inbox when pressing the button.

### 5. Reply
Users can reply to any email from the detailed view.  
The reply form automatically pre-fills:
- The original sender as the recipient  
- A subject prefixed with `Re:` (unless already present)  
- A quoted version of the original message in the body  

Feel free to explore the code or test the application.
