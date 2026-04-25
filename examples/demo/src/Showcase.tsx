import React from 'react';
import { createRoot } from 'react-dom/client';
import ShowcasePage from './ShowcasePage.js';
import './styles.css';
import 'reactflow/dist/style.css';

createRoot(document.getElementById('root')!).render(<ShowcasePage />);
