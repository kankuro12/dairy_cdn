Array.prototype.groupBy = function (key) {
    return this.reduce((result, item) => {
        const group = item[key];
        if (!result[group]) {
            result[group] = [];
        }
        result[group].push(item);
        return result;
    }, {});
};

Array.prototype.keyBy = function (key) {
    return this.reduce((result, item) => {
        const group = item[key];
        result[group] = item;
        return result;
    }, {});
};

Array.prototype.sum = function (key) {
    return this.reduce((sum, item) => {
        if (key && item.hasOwnProperty(key)) {
            return sum + Number(item[key]);
        }
        return sum + item;
    }, 0);
};
Array.prototype.sumExp = function (fun) {
    return this.reduce((sum, item) => {

        return sum + fun(item);
    }, 0);
};

Array.prototype.avg = function (key) {
    return parseFloat((this.sum(key) / this.length).toFixed(4));
};

Array.prototype.sumMultiple = function (keys) {
    return this.reduce((sum, item) => {
        let s = 0;
        keys.forEach(key => {
            if (key && item.hasOwnProperty(key)) {
                s += Number(item[key]);
            }
        });
        return sum + s;
    }, 0);
};


Array.prototype.pluckUnique = function (key) {
    return [...new Set(this.map(item => item[key]))];
};

Array.prototype.pluck = function (key) {
    return this.map(item => item[key]);
};

Array.prototype.groupBySum = function (key, sumkey, type = 'number') {
    return this.reduce((result, item) => {
        const group = item[key];
        if (!result[group]) {
            result[group] = 0;
        }
        if (type == 'number') {

            result[group] += Number(item[sumkey]);
        } else {
            result[group] += item[sumkey];
        }
        return result;
    }, {});
};

Array.prototype.unique = function () {
    return [...new Set(this)];
};

Array.prototype.aggregateByKey = function (...keys) {
    return this.reduce((result, item) => {
        const keyPath = keys.map(key => item[key]).join('.');
        if (!result[keyPath]) {
            result[keyPath] = { qty: 0, amount: 0 };
        }
        result[keyPath].qty += item.qty || 0;
        result[keyPath].amount += item.amount || 0;
        return result;
    }, {});
};



Array.prototype.where = function (k, d) {

    return this.filter(o => o[k] == d);
};
Array.prototype.whereNull = function (k) {
    return this.filter(o => o[k] == null);
};

Array.prototype.chunk = function (size) {
    const chunkedArray = [];

    for (let i = 0; i < this.length; i += size) {
        chunkedArray.push(this.slice(i, i + size));
    }

    return chunkedArray;
};

Array.prototype.whereLike = function (t, e) { return this.filter(r => { let i = r[t].toString().toLowerCase(), s = e.toLowerCase(); if (s.startsWith("%") && s.endsWith("%")) { let n = s.slice(1, -1); return i.includes(n) } if (s.startsWith("%")) { let l = s.slice(1); return i.endsWith(l) } if (!s.endsWith("%")) return i === s; { let h = s.slice(0, -1); return i.startsWith(h) } }) };

Array.prototype.index = function (k, d) {
    return this.findIndex(o => o[k] == d);
};

Array.prototype.whereNotIn = function (k, exclusionArray) {
    return this.filter(element => !exclusionArray.includes(element[k]));
};

Array.prototype.whereNot = function (k, d) {
    return this.filter(element => element[k] != d);
};




Array.prototype.like = function (k, d) { return this.filter(o => o[k].toString().includes(d)); };

Array.prototype.first = function (k = null, d = null) {

    if (k == null && d == null) {
        if (this.length == 0) {
            return undefined;
        }
        return this[0];

    }
    return this.find(o => o[k] == d);


};

Array.prototype.sortBy = function (t = "asc", e = null) { if (0 === this.length) return this; let r = (t, r) => { let o = e ? t[e] : t, s = e ? r[e] : r; if ("number" == typeof o && "number" == typeof s) return o - s; if ("string" == typeof o && "string" == typeof s) return o.localeCompare(s); throw Error("Unsupported data type for sorting") }; if ("asc" === t) this.sort(r); else if ("desc" === t) this.sort((t, e) => r(e, t)); else throw Error("Invalid sort direction"); return this };

Array.prototype.last = function (k = null, d = null) {
    if (k == null && d == null) {
        if (this.length == 0) {
            return undefined;
        }
        return this[this.length - 1];
    }
    return this.findLast(o => o[k] == d);
};

Array.prototype.take = function (num = 1,) {
    if (this.length == 0) {
        return [];
    }
    if (num > this.length) {
        num = this.length;
    }
    return this.slice(0, num);
};

Array.prototype.isSubset = function (t) { if (!Array.isArray(t)) return !1; if (0 === t.length) return !0; let e = new Set(t); for (let r = 0; r < this.length; r++)if (e.has(this[r]) && (e.delete(this[r]), 0 === e.size)) return !0; return !1 };
Array.prototype.whereIn = function (r, e) { if (!Array.isArray(e)) throw TypeError("values should be an array"); return this.filter(t => e.includes(t[r])) };
Array.prototype.zeroAtLast = function (t) { return this.sort((o, r) => 0 === o[t] && 0 !== r[t] ? 1 : 0 !== o[t] && 0 === r[t] ? -1 : 0) };
Array.prototype.toCSV = function (t = "data.csv") { let e = this.map(t => t.join(",")).join("\n"), i = new Blob([e], { type: "text/csv;charset=utf-8;" }), o = document.createElement("a"); if (void 0 !== o.download) { let d = URL.createObjectURL(i); o.setAttribute("href", d), o.setAttribute("download", t), o.style.visibility = "hidden", document.body.appendChild(o), o.click(), document.body.removeChild(o) } };
Array.prototype.toHashMap = function (t, o) { return this.reduce((e, r) => (void 0 !== r[t] && (e[r[t]] = r[o]), e), {}) };

Array.prototype.getMaxByProperty = function (a) {
    if (0 === this.length) return null;
    return this.reduce((b, c) => c[a] > b[a] ? c : b, this[0])
};



// Array.prototype.getMax = function(a) {
//     if (0 === this.length) return null;
//     if (1 === this.length) return this[0][a];
//     return this.reduce((b, c) => c[a] > b[a] ? c[a] : b[a], this[0][a])
// };


Array.prototype.getMax = function (propName) {
    if (this.length === 0) {
        return null;
    }

    let maxPropertyValue = this[0][propName];

    for (let i = 1; i < this.length; i++) {
        if (this[i].hasOwnProperty(propName)) {
            if (this[i][propName] > maxPropertyValue) {
                maxPropertyValue = this[i][propName];
            }
        } else {
            throw new Error(`Object at index ${i} does not have property '${propName}'.`);
        }
    }

    return maxPropertyValue;
};

Array.prototype.min = function (t) { if (0 !== this.length) return this.reduce((e, i) => t ? i[t] < e[t] ? i : e : i < e ? i : e, this[0]) };


// Array.prototype.sortBy = function(k, d = 'asc') {
//     const s = [...this];
//     s.sort((a, b) => {
//         const v = typeof a[k] === 'string' ? a[k].toLowerCase() : a[k],
//             w = typeof b[k] === 'string' ? b[k].toLowerCase() : b[k];
//         return v < w ? (d === 'asc' ? -1 : 1) : v > w ? (d === 'asc' ? 1 : -1) : 0
//     });
//     return s
// };