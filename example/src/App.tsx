import { FC } from "react";
import { ExampleTON } from "./ExampleTON";
import { ExampleSolana } from "./ExambleSolana";
import { ExampleEVM } from "./ExampleEVM";
import { ExampleNEAR } from "./ExampleNEAR";

const App: FC = () => {
  return (
    <>
      <ExampleTON />
      <ExampleSolana />
      <ExampleEVM />
      <ExampleNEAR />
    </>
  );
};

export default App;
