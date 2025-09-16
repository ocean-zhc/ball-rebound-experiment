// 全局变量
let chart1, chart2;
let currentGroup = '第一组';
let allGroupsData = {};

// 默认的原始实验数据
const defaultData = {
    exp1: { fall: [130, 130, 130], rebound: [89, 61.4, 42] },
    exp2: { fall: [130, 110, 90], rebound: [89, 76, 60] }
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
    const exp2FallInputs = table2.rows[0].querySelectorAll('input[type="number"]');
    const exp2ReboundInputs = table2.rows[1].querySelectorAll('input[type="number"]');
    data.exp2.fall.forEach((val, i) => exp2FallInputs[i].value = val);
    data.exp2.rebound.forEach((val, i) => exp2ReboundInputs[i].value = val);
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
    data.exp2.fall = Array.from(table2.rows[0].querySelectorAll('input[type="number"]')).map(input => parseFloat(input.value) || 0);
    data.exp2.rebound = Array.from(table2.rows[1].querySelectorAll('input[type="number"]')).map(input => parseFloat(input.value) || 0);

    // === 新增：将数据保存到 localStorage ===
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
    chart1.data.datasets[0].data = ratios;
    chart1.update();
}

// 更新实验二
function updateExperiment2() {
    saveDataForCurrentGroup();
    const tableBody = document.getElementById('table-2');
    const ratioRow = tableBody.rows[2];
    const { fall, rebound } = allGroupsData[currentGroup].exp2;
    const ratios = [];

    for (let i = 0; i < 3; i++) {
        const ratio = fall[i] > 0 ? (rebound[i] / fall[i]) : 0;
        ratioRow.cells[i + 1].innerText = ratio.toFixed(2);
        ratios.push(ratio);
    }
    
    chart2.data.datasets[0].data = ratios;
    chart2.data.labels = fall;
    chart2.update();
}

// 页面加载完成后执行初始化
window.onload = function() {
    const groupSelector = document.getElementById('group-selector');
    const groupDisplay = document.getElementById('current-group-display');
    const resetButton = document.getElementById('reset-data-button');

    groupSelector.addEventListener('change', function() {
        currentGroup = this.value;
        groupDisplay.innerText = '当前记录小组: ' + currentGroup;
        loadGroupData(currentGroup);
    });
    
    // === 新增：重置按钮的事件监听 ===
    resetButton.addEventListener('click', function() {
        if (confirm('您确定要重置所有小组的数据吗？此操作不可撤销。')) {
            localStorage.removeItem('ballExperimentData');
            location.reload();
        }
    });

    const chartOptions1 = {
        responsive: true, maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, max: 1.0, title: { display: true, text: '反弹高度 / 下落高度 比值' } } }
    };
    const chartOptions2 = {
        responsive: true, maintainAspectRatio: false,
        scales: {
            x: { title: { display: true, text: '下落高度 (cm)'} },
            y: { beginAtZero: true, max: 1.0, title: { display: true, text: '反弹高度 / 下落高度 比值' } }
        }
    };
    
    const ctx1 = document.getElementById('chart-1').getContext('2d');
    chart1 = new Chart(ctx1, {
        type: 'line',
        data: { labels: ['1号球', '2号球', '3号球'], datasets: [{ label: '回弹比值', borderColor: 'rgb(75, 192, 192)', tension: 0.1 }] },
        options: chartOptions1
    });
    const ctx2 = document.getElementById('chart-2').getContext('2d');
    chart2 = new Chart(ctx2, {
        type: 'line',
        data: { labels: [], datasets: [{ label: '回弹比值', borderColor: 'rgb(255, 99, 132)', tension: 0.1 }] },
        options: chartOptions2
    });
    
    // 页面加载时，设置或加载数据
    setupData();
    loadGroupData(currentGroup);
};