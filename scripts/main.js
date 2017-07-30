async function getLatestAccountHistory(username) {
    var hist = await steem.api.getAccountHistory(username, -1, 0);
    return hist[0][0];
}

async function getAllAccountHistory(username) {
    var res = [];
    let max_id = await getLatestAccountHistory(username);

    let quotient = Math.floor(max_id / 1000);
    let remainder = max_id % 1000;
    console.log(quotient, remainder);

    res.push(... await steem.api.getAccountHistory(username, remainder, remainder));
    for (var i=1; i<=quotient; i++) {
        res.push(... await steem.api.getAccountHistory(username, remainder + i*1000, 999));
    }
    
    console.log('getAllAccountHistory() called: <- ' + username);
    return {
        max_id: max_id, 
        history: res
    };
}

let username = 'jeongmincha';
getAllAccountHistory(username).then(function(result){
    console.log(result.max_id);
});