// 注意: 把 Personal Access Token 放在前端有泄露风险。建议通过后端代理或环境变量来隐藏 Token。
const AIRTABLE_PERSONAL_ACCESS_TOKEN = 'patfGdCh59IAjo06J.bdf04336b77d67108d5430bd3bb2f864f46bae631c35fbcb59d96bfb9ceb0655';
const AIRTABLE_BASE_ID = 'app8mfRU8WD718F0Y';
const AIRTABLE_TABLE_NAME = 'Sign Up Table';

// 正确构建 Airtable API URL（对表名进行编码）
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

// 获取页面上的元素
const form = document.getElementById('registration-form');
const submitButton = document.getElementById('submit-button');
const resultsContainer = document.getElementById('results-container');

if (!form || !submitButton || !resultsContainer) {
    console.warn('页面元素未找到，请确认 HTML 中有 id 为 registration-form / submit-button / results-container 的元素。');
}

/**
 * 功能1: 提交报名数据到 Airtable
 */
form && form.addEventListener('submit', async (event) => {
    event.preventDefault(); // 阻止表单默认的刷新页面行为

    // 获取用户输入的值
    var nameEl = document.getElementById('name-input');
    var emailEl = document.getElementById('email-input');
    var name = nameEl && nameEl.value ? nameEl.value : '';
    var email = emailEl && emailEl.value ? emailEl.value : '';

    if (!name || !email) {
        alert('请填写姓名和邮箱。');
        return;
    }

    submitButton.disabled = true; // 防止重复提交
    var originalText = submitButton.textContent;
    submitButton.textContent = '提交中...';

    var payload = {
        fields: {
            Name: name,
            Email: email
        }
    };

    try {
        var response = await fetch(AIRTABLE_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + AIRTABLE_PERSONAL_ACCESS_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            var text = '';
            try { text = await response.text(); } catch (e) {}
            throw new Error('网络响应错误: ' + response.status + ' ' + response.statusText + ' ' + text);
        }

        alert('报名成功!');
        form.reset(); // 清空表单
        await fetchRegistrations(); // 报名成功后立即刷新列表
    } catch (error) {
        console.error('提交失败:', error);
        alert('报名失败，请稍后重试。');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText || '提交报名';
    }
});

/**
 * 功能2: 从 Airtable 获取报名列表并显示在页面上
 */
async function fetchRegistrations() {
    resultsContainer.innerHTML = '<p>正在加载...</p>'; // 显示加载状态

    try {
        // GET 请求不需要 body，只需带上 Authorization 头
        var response = await fetch(AIRTABLE_API_URL + '?pageSize=50', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + AIRTABLE_PERSONAL_ACCESS_TOKEN
            }
        });

        if (!response.ok) {
            var text = '';
            try { text = await response.text(); } catch (e) {}
            throw new Error('网络响应错误: ' + response.status + ' ' + response.statusText + ' ' + text);
        }

        var responseData = await response.json();
        var records = responseData.records || [];

        // 渲染列表
        resultsContainer.innerHTML = '';
        if (records.length === 0) {
            resultsContainer.innerHTML = '<p>还没有人报名。</p>';
        } else {
            records.forEach(function(person) {
                var personDiv = document.createElement('div');
                personDiv.className = 'person';
                var name = (person.fields && person.fields.Name) ? person.fields.Name : '(无名)';
                var email = (person.fields && person.fields.Email) ? person.fields.Email : '(无)';
                personDiv.textContent = '姓名: ' + name + ', 邮箱: ' + email;
                resultsContainer.appendChild(personDiv);
            });
        }
    } catch (error) {
        console.error('加载列表失败:', error);
        resultsContainer.innerHTML = '<p>failfail 列表, refresh!</p>';
    }
}

// 页面加载完成后，立即执行一次获取列表的函数
window.addEventListener('load', fetchRegistrations);

