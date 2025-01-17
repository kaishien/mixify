import "reflect-metadata";

import { createRoot } from "react-dom/client";
import { Application } from "./application/application.tsx";
import "./index.css";

import { configure } from 'mobx';

configure({ enforceActions: 'always' });

// biome-ignore lint/style/noNonNullAssertion: <explanation>
createRoot(document.getElementById("root")!).render(<Application />);
