import React from 'react';
import { LegalPage } from '../../components/marketing/LegalPage';
import { privacySections } from '../../data/legal';

export function Privacy() {
  return <LegalPage title="Privacy" intro="How the JolliFlow prototype handles information, and what a production version is expected to do." sections={privacySections} />;
}