// 全局变量
let chart1, chart2;
let currentGroup = '第一组';
let allGroupsData = {};

// 默认的原始实验数据
const defaultData = {
    exp1: { fall: [130, 130, 130], rebound: [89, 61.4, 42] },
    exp2: { 
        balls: [
            { falls: [130, 110, 90], rebounds: [89, 76, 60] },  // 1号球
            { falls: [130, 110, 90], rebounds: [75, 65, 52] },  // 2号球
            { falls: [130, 110, 90], rebounds: [60, 52, 40] }   // 3号球
        ]
    }
};

// 检查本地存储，若无数据则初始化
function setupData() {
    const savedData = localStorage.getItem('ballExperimentData');
    if (savedData) {
        allGroupsData = JSON.parse(savedData);
    } else {
        const groups = ['第一组', '第二组', '第三组', '第四组'];
        groups.forEach(group => {
            allGroupsData[group] = JSON.parse(JSON.stringify(defaultData));
        });
    }
    console.log("数据初始化完成。");
}

// 将指定小组的数据加载到页面
function loadGroupData(groupName) {
    const data = allGroupsData[groupName];
    const table1 = document.getElementById('table-1');
    const exp1FallInputs = table1.rows[0].querySelectorAll('input[type="number"]');
    const exp1ReboundInputs = table1.rows[1].querySelectorAll('input[type="number"]');
    data.exp1.fall.forEach((val, i) => exp1FallInputs[i].value = val);
    data.exp1.rebound.forEach((val, i) => exp1ReboundInputs[i].value = val);
    const table2 = document.getElementById('table-2');
    for (let ballIdx = 0; ballIdx < 3; ballIdx++) {
        const ballData = data.exp2.balls[ballIdx];
        const row = table2.rows[ballIdx];
        ballData.falls.forEach((val, expIdx) => {
            row.cells[expIdx * 2 + 1].querySelector('input').value = val;
        });
        ballData.rebounds.forEach((val, expIdx) => {
            row.cells[expIdx * 2 + 2].querySelector('input').value = val;
        });
    }
    console.log(`已加载小组 [${groupName}] 的数据。`);
    updateExperiment1();
    updateExperiment2();
}

// 从页面读取数据并保存到变量和本地存储
function saveDataForCurrentGroup() {
    const data = allGroupsData[currentGroup];
    const table1 = document.getElementById('table-1');
    data.exp1.fall = Array.from(table1.rows[0].querySelectorAll('input[type="number"]')).map(input => parseFloat(input.value) || 0);
    data.exp1.rebound = Array.from(table1.rows[1].querySelectorAll('input[type="number"]')).map(input => parseFloat(input.value) || 0);
    const table2 = document.getElementById('table-2');
    data.exp2.balls = [];
    for (let ballIdx = 0; ballIdx < 3; ballIdx++) {
        const row = table2.rows[ballIdx];
        const falls = [];
        const rebounds = [];
        for (let expIdx = 0; expIdx < 3; expIdx++) {
            falls.push(parseFloat(row.cells[expIdx * 2 + 1].querySelector('input').value) || 0);
            rebounds.push(parseFloat(row.cells[expIdx * 2 + 2].querySelector('input').value) || 0);
        }
        data.exp2.balls.push({ falls, rebounds });
    }
    localStorage.setItem('ballExperimentData', JSON.stringify(allGroupsData));
}

// 同步高度
function syncFallHeights(firstInput) {
    const tableBody = document.getElementById('table-1');
    const fallInputs = tableBody.rows[0].querySelectorAll('input[type="number"]');
    const firstFallHeight = firstInput.value;
    fallInputs[1].value = firstFallHeight;
    fallInputs[2].value = firstFallHeight;
}

// 更新实验一
function updateExperiment1() {
    saveDataForCurrentGroup();
    const tableBody = document.getElementById('table-1');
    const ratioRow = tableBody.rows[2];
    const { fall, rebound } = allGroupsData[currentGroup].exp1;
    const ratios = [];

    for (let i = 0; i < 3; i++) {
        const ratio = fall[i] > 0 ? (rebound[i] / fall[i]) : 0;
        ratioRow.cells[i + 1].innerText = ratio.toFixed(2);
        ratios.push(ratio);
    }
    
    // [诊断日志] 在控制台打印将要用于图表的数据
    console.log('准备更新【实验一】图表，数据为:', ratios);

    if (chart1) {
        chart1.data.datasets[0].data = ratios;
        chart1.update();
        console.log('【实验一】图表已调用 update()。');
    } else {
        console.error('【实验一】图表 (chart1) 未初始化！');
    }
}

// 更新实验二
function updateExperiment2() {
    saveDataForCurrentGroup();
    const table2 = document.getElementById('table-2');
    const data = allGroupsData[currentGroup].exp2;
    
    const datasetsData = [];
    for (let ballIdx = 0; ballIdx < 3; ballIdx++) {
        const ballData = data.balls[ballIdx];
        const ratios = [];
        const ratioRow = table2.rows[ballIdx + 3];
        
        for (let expIdx = 0; expIdx < 3; expIdx++) {
            const fall = ballData.falls[expIdx];
            const rebound = ballData.rebounds[expIdx];
            const ratio = fall > 0 ? (rebound / fall) : 0;
            ratios.push(ratio);
            ratioRow.cells[expIdx * 2 + 1].innerText = ratio.toFixed(2);
        }
        datasetsData.push(ratios);
    }
    
    // [诊断日志] 在控制台打印将要用于图表的数据
    console.log('准备更新【实验二】图表，数据为:', datasetsData);

    if (chart2) {
        for (let i = 0; i < 3; i++) {
            chart2.data.datasets[i].data = datasetsData[i];
        }
        chart2.update();
        console.log('【实验二】图表已调用 update()。');
    } else {
        console.error('【实验二】图表 (chart2) 未初始化！');
    }
}

// 页面加载完成后执行初始化
window.onload = function() {
    console.log("页面加载完成，开始执行初始化脚本...");
    const groupSelector = document.getElementById('group-selector');
    const groupDisplay = document.getElementById('current-group-display');
    const resetButton = document.getElementById('reset-data-button');

    groupSelector.addEventListener('change', function() {
        currentGroup = this.value;
        groupDisplay.innerText = '当前记录小组: ' + currentGroup;
        loadGroupData(currentGroup);
    });
    
    resetButton.addEventListener('click', function() {
        if (confirm('您确定要重置所有小组的数据吗？此操作不可撤销。')) {
            localStorage.removeItem('ballExperimentData');
            location.reload();
        }
    });
    
    const ctx1 = document.getElementById('chart-1').getContext('2d');
    chart1 = new Chart(ctx1, {
        type: 'line',
        data: { 
            labels: ['1号球', '2号球', '3号球'], 
            datasets: [{ 
                label: '回弹比值', 
                data: [], 
                borderColor: 'rgb(75, 192, 192)', 
                tension: 0.1 
            }] 
        },
        options: {
            responsive: true, 
            maintainAspectRatio: false,
            scales: { 
                y: { 
                    beginAtZero: true, 
                    max: 1.0, 
                    title: { 
                        display: true, 
                        text: '反弹高度是下落高度的几分之几' 
                    } 
                } 
            }
        }
    });
    console.log("【实验一】图表对象已创建。");

    const ctx2 = document.getElementById('chart-2').getContext('2d');
    chart2 = new Chart(ctx2, {
        type: 'line',
        data: { 
            labels: ['第一次实验', '第二次实验', '第三次实验'], 
            datasets: [
                { label: '1号球', data: [], borderColor: 'rgb(255, 99, 132)', tension: 0.1 },
                { label: '2号球', data: [], borderColor: 'rgb(54, 162, 235)', tension: 0.1 },
                { label: '3号球', data: [], borderColor: 'rgb(75, 192, 192)', tension: 0.1 }
            ] 
        },
        options: {
            responsive: true, 
            maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: '实验次数' } },
                y: { 
                    beginAtZero: true, 
                    max: 1.0,
                    title: { display: true, text: '反弹高度是下落高度的几分之几' } 
                }
            }
        }
    });
    console.log("【实验二】图表对象已创建。");
    
    setupData();
    loadGroupData(currentGroup);
};