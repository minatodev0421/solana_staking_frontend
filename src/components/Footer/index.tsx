import React from "react";

import { getImg } from "../../utils/Helper";
import './index.css';

const Footer = () => {
    const gotoPage = (url: string) => {
        window.open(url, '_blank')
    }

    return (
        <footer>
            <div className="d-flex align-items-center justify-content-right">
                <div className="no-group">
                    &nbsp;
                </div>
                <div className="social-group">
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="socials align-items-center justify-content-center social-menu">
                            <img src={getImg('icons/twitter.png')} alt="logo" onClick={() => gotoPage('https://twitter.com/punkyapesclub')} />
                        </div>  
                        <div className="socials align-items-center justify-content-center social-menu">
                            <img src={getImg('icons/discord.png')} alt="logo" onClick={() => gotoPage('https://discord.com/punkyapesclub')} />
                        </div>  
                    </div>
                    <p className="copyright">©2022 PUNKY APES CLUB.ALL RIGHT RESERVED</p>
                </div>
                <div className="copyright-group">
                &nbsp;
                </div>
            </div>
        </footer>
    )
}

export default Footer