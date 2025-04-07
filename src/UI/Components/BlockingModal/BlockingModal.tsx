import React, { useEffect, useState } from 'react';
import { Content, Flex, FlexItem, Spinner } from '@patternfly/react-core';
import { Modal } from '@patternfly/react-core/deprecated';
import { words } from '@/UI/words';

export const BlockingModal = () => {
  const [isBlockerOpen, setIsBlockerOpen] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const toggleModalHalt = () => {
      setIsBlockerOpen((state) => !state);
      setMessage(words('environment.halt.process'));
    };
    const toggleModalResume = () => {
      setIsBlockerOpen((state) => !state);
      setMessage(words('environment.resume.process'));
    };

    document.addEventListener('halt-event', toggleModalHalt);
    document.addEventListener('resume-event', toggleModalResume);

    return () => {
      document.removeEventListener('halt-event', toggleModalHalt);
      document.removeEventListener('resume-event', toggleModalResume);
    };
  }, []);

  return (
    <Modal
      aria-label="halting-blocker"
      isOpen={isBlockerOpen}
      disableFocusTrap
      variant="small"
      showClose={false}
    >
      <Flex
        direction={{ default: 'column' }}
        justifyContent={{ default: 'justifyContentCenter' }}
        alignItems={{ default: 'alignItemsCenter' }}
      >
        <FlexItem>
          <Content component="h2">{message}</Content>
        </FlexItem>
        <FlexItem>
          <Spinner size="lg" />
        </FlexItem>
      </Flex>
    </Modal>
  );
};
