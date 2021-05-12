d3.csv("data2.csv").then(d => chart2(d))

function chart2(data) {

    //
    // data/key value computations
    //

    var copy = [];

    var keys = data.columns.slice(1);
    keys.forEach(d => copy.push(d.split(' ')))

    var type = [...new Set(copy.map(d => d[2]))]
    var xMap = [...new Set(data.map(d => d.State))]

    var options = d3.select("#options2").selectAll("option")
        .data(type)
        .enter().append("option")
        .attr("value", d => d)
        .text(d => "Time: " + d)

    //
    // append svg and axis
    //

    var svg = d3.select("#svg2"),
        margin = {top: 25, right: 20, bottom: 25, left: 30},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    var x0 = d3.scaleBand()
        .rangeRound([margin.left, width - margin.right])
        .paddingInner(.1)
        .paddingOuter(.1);

    var x1 = d3.scaleBand()
        .padding(0.05)

    var y = d3.scaleLinear()
        .rangeRound([height, margin.top]);

    var xAxis = svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")

    svg.append("text")
        .attr("transform",
            "translate(" + (width/2) + " ," +
            (height + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text("Empty Trip Duration in Hours");

    var yAxis = svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", "translate(" + margin.left + ",0)")

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 60 - margin.left)
        .attr("x",140 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Frequency");

    var teamColor = d3.scaleOrdinal()
        .range(["red", "orange", "yellow", "green", "blue", "indigo", "violet"]);

    update(d3.select("#options2").property("value"), 0);

    function update(input, speed) {

        //
        // sort and filter data
        //

        var teams = keys.filter(f => f.includes(input))

        data.forEach(function(d) {
            var sum = 0;
            for (var i = 0; i < teams.length; i++) {
                sum += +d[teams[i]]
            }
            d.total = sum;
            return d;
        })

        data.sort(d3.select("#sort2").property("checked")
            ? (a, b) => b.total - a.total
            : (a, b) => xMap.indexOf(a.State) - xMap.indexOf(b.State))

        y.domain([0, d3.max(data, d => d.total)]).nice();

        x0.domain(data.map(d => d.State))
        x1.domain(teams).rangeRound([0, x0.bandwidth()])

        //
        // append rectangles
        //

        var barGroups = svg.selectAll(".layer")
            .data(data, d => d.State);

        barGroups.exit().remove();

        barGroups.enter().append("g")
            .classed('layer', true);

        svg.selectAll(".layer").transition().duration(speed)
            .attr("transform", d => "translate(" + x0(d.State) + ",0)")

        var bars = svg.selectAll(".layer").selectAll(".bars")
            .data(function(d) {
                return teams.map(function(key) {
                    return {key: key, value: +d[key]};
                });
            })

        bars.exit().remove()

        bars.enter().append("rect")
            .attr("class", "bars")
            .attr("fill", d => teamColor(d.key))
            .merge(bars)
            .transition().duration(speed)
            .attr("width", x1.bandwidth())
            .attr("x", d => x1(d.key))
            .attr("y", d => y(d.value))
            .attr("height", d => height - y(d.value))

        var totalBars = svg.selectAll(".totalBars")
            .data(data, d => d.State)

        totalBars.exit().remove()

        totalBars.enter().append("rect")
            .attr("class", "totalBars")
            .attr("fill", "none")
            .attr("stroke", "#555")
            .attr("width", x0.bandwidth())
            .merge(totalBars)
            .transition().duration(speed)
            .attr("x", d => x0(d.State))
            .attr("y", d => y(d.total))
            .attr("height", d => height - y(d.total))

        //
        // call y & x axis
        //

        yAxis.transition().duration(speed)
            .call(d3.axisLeft(y).ticks(null, "s"))

        xAxis.transition().duration(speed)
            .call(d3.axisBottom(x0));
    }

    var select = d3.select("#options2")
        .style("border-radius", "5px")
        .style("padding", "1px 3px 1px 3px")
        .on("change", function() {
            update(this.value, 750)
        })

    var checkbox = d3.select("#sort2")
        .style("margin-left", "50%")
        .on("click", function() {
            update(select.property("value"), 750)
        })
}