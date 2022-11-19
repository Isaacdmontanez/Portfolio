import React from 'react';
import {HashRouter, Route, Routes, Link } from 'react-router-dom';
import Graphing from './components/webpages/graphing';
import Sorting from './components/webpages/sorting';
import Chess from './components/webpages/chessBoard';
import Home from './components/webpages/home';
import './components/css/navBar.css'

export default function App () {
  return (
    <HashRouter basename="/portfolio">
      <nav className = 'navBar'>
        <Link to = "/" id = "link">Home</Link>
        <Link to = "/chess" id = "link">Chess</Link>
        <Link to = "/graphing" id = "link">Graphing</Link>
        <Link to = "/sorting" id = "link">Sorting</Link>
      </nav>
      <Routes>
        <Route path = "/" element = {<Home/>}/>
        <Route path = "/chess" element = {<Chess/>}/>
        <Route path = "/graphing" element = {<Graphing/>}/>
        <Route path = "/sorting" element = {<Sorting/>}/>
      </Routes>
    </HashRouter>
  );
};