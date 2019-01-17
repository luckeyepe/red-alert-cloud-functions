const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp();

//only fires up when a message for a user is written in the latest messages
exports.notifyNewNotificationMessage = functions.firestore
.document('Notification_Massages/{message}')
.onWrite((change, context) => {
    const document = change.after.exists ? change.after.data() : null;
    const docSnaphshot = document;

    //grab and save the data from the message
    const message = docSnaphshot;
    const recieverID = message.message_recieverID
    const senderName = message.message_senderName
    console.log("Receiver ID: "+recieverID);
    console.log("Sender Name: "+senderName);
    

    // admin.firestore().doc('path/to/doc').get().then(snapshot => {
    //     const data = snapshot.data()  // a plain JS object 
    // })
    return admin.firestore().doc('Users/'+recieverID).get().then(userDoc => {
        //grab device token from the user
        const recieverUser = userDoc.data();
        const receiverToken = recieverUser['user_token'];   

        console.log("Receiver Name: "+recieverUser['user_firstName']);
        console.log("Receiver Token: "+receiverToken);
        
        /*structure of the notification
        title: title of the notification
        body: message of the notification
        click: (optional) launches action from manifest
        */

        //check if the massage is text or image, and then assigns a value for the notification's body
        // const notificationBody = (message['message_type'] === "text") ? message['message_messageContent']: "You received a new image message";
        var notificationBody = "";
        switch (message['message_type']) {
            case "text":
                notificationBody = message['message_messageContent'];
                break;

            case "image":
                notificationBody = "You received a new image message";
            break;

            case "emergency":
                notificationBody = "Please help me";
                break;
        }


        const payload = {
            notification:{
                title: senderName + " sent you a message",
                body: notificationBody,
                click: "ChatLogActivity"
            }
        };

        console.log("Notification Title: "+payload.notification.title);
        console.log("Notification Message: "+payload.notification.body);
        

        return admin.messaging().sendToDevice(receiverToken, payload);
    });
});

exports.notifyNewUser = functions.firestore
.document('Users/{user}')
.onCreate((docSnaphshot, context) => {
    //grab and save the data from the message
    const user = docSnaphshot.data();
    const user_token = user['user_token']
    const user_name = user['user_firstName']
    console.log("User Token: "+user_token);
    console.log("User First Name: "+user_name);
    
});
