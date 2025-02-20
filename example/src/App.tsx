import { FC } from "react";
import { ExampleTON } from "./ExampleTON";
import { ExampleSolana } from "./ExambleSolana";
import { ExampleEVM } from "./ExampleEVM";
import { ExampleNEAR } from "./ExampleNEAR";
import { ExampleStellar } from "./ExampleStellar";

const App: FC = () => {
  return (
    <>
      <ExampleTON />
      <ExampleSolana />
      <ExampleEVM />
      <ExampleNEAR />
      <ExampleStellar />
    </>
  );
};

export default App;
