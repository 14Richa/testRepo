import requests
from ibm_watson import ToneAnalyzerV3
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator


def main():
    pr_or_issue = get_pr_or_issue()
    content = pr_or_issue['body'] or pr_or_issue['title']
    tone_analyzer = get_tone_analyzer()
    tone_analysis = tone_analyzer.tone(
        {'text': content}, content_type='text/plain').get_result()
    tones = tone_analysis['document_tone']['tones']
    for tone in tones:
        print(f"{tone['tone_name']}: {tone['score']}")


def get_pr_or_issue():
    headers = {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': f'token {os.environ.get("GITHUB_TOKEN")}'
    }
    url = os.environ.get('GITHUB_EVENT_PATH')
    response = requests.get(url, headers=headers)
    return response.json()


def get_tone_analyzer():
    authenticator = IAMAuthenticator(os.environ.get('IBM_API_KEY'))
    tone_analyzer = ToneAnalyzerV3(
        version='2021-03-25',
        authenticator=authenticator
    )
    tone_analyzer.set_service_url(os.environ.get('IBM_URL'))
    return tone_analyzer


if __name__ == '__main__':
    main()
