/* typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { NavLink } from 'react-router-dom'
import { getImg } from "../../utils/Helper";
import './index.css';

const Header = (props:any) => {
    const [isOpen] = useState(false)
    const gotoPage = (url: string) => {
        window.open(url, '_blank');
    }
    return (
        <header>
            <div className="header-div align-items-baseline">
                    <div className="d-flex align-items-center jsutify-content-center menu-bar">
                        <div className="menu-item text-center">
                            <p onClick={() => gotoPage('https://punkyapesclub.com/#about')}>
                                ABOUT
                            </p>
                        </div>
                        <div className="menu-item text-center">
                            
                        <p onClick={() => gotoPage('https://punkyapesclub.com/#tokenomics')}>
                                TOKENOMICS
                            </p>
                            
                        </div>
                        <div className="menu-item text-center">
                        <p onClick={() => gotoPage('https://punkyapesclub.com/#roadmap')}>
                                ROADMAP
                            </p>
                        </div>
                        
                    </div>
                    <NavLink to="/" className={`d-flex align-items-center jsutify-content-center`}>
                        <img src={getImg('punky_apes_logo.png')} alt="logo" />
                    </NavLink>
                    <div className="d-flex align-items-center jsutify-content-center menu-bar">

                        <div className="menu-item text-center">
                        <p onClick={() => gotoPage('https://punkyapesclub.com/#gallery')}>
                                GALLERY
                            </p>
                        </div>
                        <div className="menu-item text-center">
                        <p onClick={() => gotoPage('https://punkyapesclub.com/#team')}>
                                TEAM
                            </p>
                        </div>
                        <div className="menu-item text-center">
                        <p onClick={() => gotoPage('https://punkyapesclub.com/#faqs')}>
                                FAQS
                            </p>
                        </div>
                    </div>
            </div>
            {isOpen && <div className="menu">
                <div>
                    <div>Disconnect</div>
                </div>
            </div>}
        </header>
    )
}

export default Header