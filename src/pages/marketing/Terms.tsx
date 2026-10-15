import React from 'react';
import { LegalPage } from '../../components/marketing/LegalPage';
import { termsSections } from '../../data/legal';

export function Terms() {
  return <LegalPage title="Terms of use" intro="The ground rules for exploring the JolliFlow prototype." sections={termsSections} />;
}