async function getLatestAccountHistory(username) {
    var hist = await steem.api.getAccountHistory(username, -1, 0);
    return hist[0][0];
}

async function getContent(username, permlink) {
    return await steem.api.getContent(username, permlink);
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

async function getPermlinks(username) {

    var result = await getAllAccountHistory(username);
    var permlink_set = new Set();

    for (var i = 0; i < result.max_id + 1; i++) {
        let obj = result.history[i];
        let type = obj[1].op[0];
        let body = obj[1].op[1];
        if (type == 'comment' && body.parent_author == "") {
            permlink_set.add(body.permlink);
        }
    }

    console.log(permlink_set);
    return permlink_set;
}

async function getVoteCounter(username, permlinks) {

    var vote_counter = {};

    permlinks.forEach(async (permlink) => {

        var content = await steem.api.getContent(username, permlink);
        let votes = content.active_votes;

        for (var i = 0; i < votes.length; i++) {

            let voter = votes[i].voter;
            if ( voter in vote_counter ) {
                vote_counter[voter] += 1;
            } else {
                vote_counter[voter] = 1;
            }
        }
    });

    console.log(vote_counter);
    return vote_counter;
}

let username = 'jeongmincha';

getPermlinks(username).then(function(result){
    let permlinks = result;
    getVoteCounter(username, permlinks);
});
