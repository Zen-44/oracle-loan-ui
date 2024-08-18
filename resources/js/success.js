window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const actionType = urlParams.get('action');
    let content = document.getElementById('content');
    console.log(actionType);
    switch (actionType){
        case "proposeOracle":{
            content.innerHTML = `<h3>Now that your oracle was proposed, you need to obtain approval for your loan.</h3>
                                <h3>To do this, head to our <a href="https://discord.gg/idena-community-634481767352369162">discord server</a>, channel <a href="https://discord.com/channels/634481767352369162/1273921357918240801">#oracle-loan</a>.</h3>
                                <h3>Or if you don't like discord, contact <a href="https://t.me/ZenMaster44">@ZenMaster44</a> on Telegram.</h3>`;
            break;
        }
        case "payOracleFee":{
            content.innerHTML = `<h3>Your oracle fee payment transaction was broadcast!</h3>
                                <h3>Your oracle will soon receive the coins needed to start it.</h3>
                                <h3>Don't forget to launch it from the Idena client!</h3>`;
            break;
        }
        default:{
            content.innerHTML = `<h3>The transaction was broadcasted to the network!</h3>`;
            break;
        }
    }
}