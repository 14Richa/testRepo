import os
import requests

headers = {
    'Authorization': f'token {os.environ["GITHUB_TOKEN"]}',
    'Accept': 'application/vnd.github.squirrel-girl-preview+json'
}


def get_reactions(url):
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    data = response.json()
    reactions = {}
    for reaction in data:
        reactions[reaction['content']] = reaction['users']['total_count']
    return reactions


def main():
    event_type = os.environ['GITHUB_EVENT_NAME']
    if event_type == 'pull_request':
        url = os.environ['GITHUB_API_URL'] + '/repos/' + os.environ['GITHUB_REPOSITORY'] + \
            '/pulls/' + os.environ['GITHUB_EVENT_NUMBER'] + '/reactions'
    elif event_type == 'issues':
        url = os.environ['GITHUB_API_URL'] + '/repos/' + os.environ['GITHUB_REPOSITORY'] + \
            '/issues/' + os.environ['GITHUB_EVENT_NUMBER'] + '/reactions'
    else:
        raise ValueError('Unsupported event type: ' + event_type)
    reactions = get_reactions(url)
    print(reactions)


if __name__ == '__main__':
    main()
