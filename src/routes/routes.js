import React from "react";
import { Route, BrowserRouter } from "react-router-dom";

import ProdutoForm from "../components/ProdutoForm";

const Routes = () => {
   return(
       <BrowserRouter>
           <Route component = { ProdutoForm }  path="/formularioproduto" />
       </BrowserRouter>
   )
}

export default Routes;