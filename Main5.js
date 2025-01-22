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