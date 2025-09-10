import React, { useEffect, useRef } from 'react';
import Talk from 'talkjs';

const Chat = ({ currentUser, otherUser }) => {
  const chatboxEl = useRef();

  useEffect(() => {
    Talk.ready.then(() => {
      const me = new Talk.User({
        id: currentUser.id.toString(),
        name: currentUser.full_name || currentUser.name,
        role: currentUser.role,
        email: currentUser.email
      });

      const other = new Talk.User({
        id: otherUser.id.toString(),
        name: otherUser.full_name || otherUser.name,
        role: otherUser.role,
        email: otherUser.email
      });

      const session = new Talk.Session({
        appId: 'tGm9muHr', // REPLACE THIS
        me: me,
      });

      const conversationId = Talk.oneOnOneId(me, other);
      const conversation = session.getOrCreateConversation(conversationId);
      conversation.setParticipant(me);
      conversation.setParticipant(other);

      const chatbox = session.createChatbox();
      chatbox.select(conversation);
      chatbox.mount(chatboxEl.current);

      return () => session.destroy();
    });
  }, [currentUser, otherUser]);

  return <div ref={chatboxEl} style={{ width: '100%', height: '500px' }} />;
};

export default Chat;