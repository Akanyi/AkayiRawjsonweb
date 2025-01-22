function openChangelogModal() {
    const modal = document.getElementById('changelogModal');
    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10); // 确保动画效果
}

function closeChangelogModal() {
    const modal = document.getElementById('changelogModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300); // 等待动画完成
}

function openDecodeModal() {
    const modal = document.getElementById('decodeModal');
    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10); // 确保动画效果
}

function closeDecodeModal() {
    const modal = document.getElementById('decodeModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300); // 等待动画完成
}

function openAboutModal() {
    const modal = document.getElementById('aboutModal');
    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10); // 确保动画效果
}

function closeAboutModal() {
    const modal = document.getElementById('aboutModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300); // 等待动画完成
}

function toggleMenu() {
    const menu = document.querySelector('.menu');
    const menuButton = menu.querySelector('.menu-button');
    const menuItems = menu.querySelectorAll('.menu-content button, .menu-content a');
    
    menu.classList.toggle('show');
    
    // 添加按钮旋转动画
    if (menu.classList.contains('show')) {
        menuButton.style.transform = 'rotate(180deg)';
        // 重置所有菜单项的过渡延迟
        menuItems.forEach((item, index) => {
            item.style.transitionDelay = `${index * 0.05}s`;
        });
    } else {
        menuButton.style.transform = 'rotate(0deg)';
        // 关闭时移除延迟
        menuItems.forEach(item => {
            item.style.transitionDelay = '0s';
        });
    }
}

// 添加自动收起菜单功能
document.addEventListener('DOMContentLoaded', () => {
    const menu = document.querySelector('.menu');
    const menuButton = menu.querySelector('.menu-button');

    // 处理点击事件
    document.addEventListener('click', (event) => {
        // 如果菜单是展开的，并且点击的不是菜单内的元素
        if (menu.classList.contains('show') && 
            !menu.contains(event.target) && 
            event.target !== menuButton) {
            // 收起菜单
            menu.classList.remove('show');
            menuButton.style.transform = 'rotate(0deg)';
            // 重置所有菜单项的过渡延迟
            const menuItems = menu.querySelectorAll('.menu-content button, .menu-content a');
            menuItems.forEach(item => {
                item.style.transitionDelay = '0s';
            });
        }
    });

    // 阻止菜单内的点击事件冒泡
    menu.addEventListener('click', (event) => {
        if (event.target !== menuButton) {
            event.stopPropagation();
        }
    });
});
