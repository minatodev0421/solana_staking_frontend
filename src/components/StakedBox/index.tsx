import Button from "../Button/index";
import './index.css';

const StakedBox = (props: any) => {
    return (
        <div className="staked-nft div-box">
            <div className="img-div">
                <img src={`${props.img}`} alt='img' />
            </div>
            <div className="div-detail">
                <div className="solbouncer">
                    <span className="span-name">
                        {props.name}
                    </span>
                </div>
                <div className="rewards">
                    <p>
                        Rewards: {props.splTokenPerDay}{" "}$PAC / Day
                    </p>
                </div>
                <div className="rank">
                    <p>
                       {props.dayPassed}{" "} day(s)Passed
                    </p>
                </div>
                <div className="current">
                    <p>
                        Current Rewards: {props.current}{" "}
                    </p>
                </div>
            </div>
            <div className="button-div">
            {
                props.canClaim ? <>
                <Button style={{ fontSize: '18px', width: 110, height: 40, margin: 'auto', 
                    backgroundColor: 'rgba(39, 35, 35, 1)',boxShadow: 'rgb(0 251 169) 0.2rem 0.2rem 1px' }}
                value={'Claim'} dark className={''} onClick={props.onClicks[0]}/>
                <Button style={{ fontSize: '18px', width: 110, height: 40, margin: 'auto', 
                    backgroundColor: 'rgba(39, 35, 35, 1)',boxShadow: 'rgb(0 251 169) 0.2rem 0.2rem 1px' }}
                value={'Unstake'} dark className={''} onClick={props.onClicks[1]}/>
                </>: <Button style={{ fontSize: '18px', width: 110, height: 40, margin: 'auto', 
                    backgroundColor: 'rgba(39, 35, 35, 1)',boxShadow: 'rgb(0 251 169) 0.2rem 0.2rem 1px' }}
                value={'Unstake'} dark className={''} onClick={props.onClicks[1]}/>
            }
            </div>
        </div>
    )
}
export default StakedBox;