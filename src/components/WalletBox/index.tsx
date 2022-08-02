import Button from "../Button/index";

import './index.css';

const WalletBox = (props: any) => {

    const { img, onClicks, lockable, locked, amount, name, loop, type } = props
    return (
        <>
        <div className={loop? 'loop div-custom-rt' : 'div-custom-rt'} >
            <div className={lockable? "egg lockable" : "egg"}>
                <img src={img} className="" alt={type === 0 ? "punky" : "punky"}/>
                {
                    lockable && 
                    <div className="description">
                        <img src={locked === true ? "lock.png" : "unlock.png"} alt="lock"/>
                        <div className="amount">
                            +{amount} $FIRE
                        </div>
                    </div>
                }
            </div>
            <div className="detail">
                <div>
                    <p className="font_20 font_600">
                        {name}
                    </p>
                </div>
                <div className="mt_5 pb_10 divider">
                </div>
                <div className="rewards">
                    <p>
                        Rewards: {props.splTokenPerDay}{" "} $PAC/ Day
                    </p>
                </div>
                <div className="button-div mt_20 pt-16">
                <Button style={{ fontSize: '18px', width: 110, height: 40, margin: 'auto', 
                    backgroundColor: 'rgba(39, 35, 35, 1)',boxShadow: 'rgb(0 251 169) 0.2rem 0.2rem 1px' }}
                value={'Stake'} dark className={''} onClick={onClicks[0]}/>
            </div>
            </div>

        </div>

        <div></div>
        </>
    )
}

export default WalletBox