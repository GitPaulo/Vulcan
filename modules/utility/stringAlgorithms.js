var stringAlgorithms = {};

stringAlgorithms.isURL = function (str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return pattern.test(str);
}

stringAlgorithms.editDistance = function (s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    var costs = new Array();

    for (var i = 0; i <= s1.length; i++) {
        var lastValue = i;
        for (var j = 0; j <= s2.length; j++) {
            if (i == 0)
                costs[j] = j;
            else {
                if (j > 0) {
                    var newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue),
                            costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }

        if (i > 0)
            costs[s2.length] = lastValue;
    }

    return costs[s2.length];
}

stringAlgorithms.levenshteinSimilarity = function (s1, s2) {
    var longer = s1;
    var shorter = s2;

    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }

    var longerLength = longer.length;

    if (longerLength == 0) {
        return 1.0;
    }

    return (longerLength - stringAlgorithms.editDistance(longer, shorter)) / parseFloat(longerLength);
}

module.exports = stringAlgorithms;