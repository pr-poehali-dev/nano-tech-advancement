import json
import re

def handler(event: dict, context) -> dict:
    '''Анализирует тональность текста: определяет позитив, негатив или нейтральный окрас'''
    
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        text = body.get('text', '').strip().lower()
        
        if not text:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Текст не может быть пустым'})
            }
        
        positive_words = [
            'хорошо', 'отлично', 'прекрасно', 'замечательно', 'великолепно',
            'супер', 'класс', 'круто', 'нравится', 'люблю', 'радость',
            'счастье', 'восторг', 'благодарность', 'спасибо', 'молодец',
            'удачно', 'успешно', 'приятно', 'рад', 'довольн', 'восхищ',
            'идеальн', 'превосходн', 'чудесн', 'отличн', '👍', '😊', '❤️', '🔥'
        ]
        
        negative_words = [
            'плохо', 'ужасно', 'отвратительно', 'кошмар', 'ужас',
            'не нравится', 'ненавижу', 'разочарование', 'грусть', 'печаль',
            'злость', 'гнев', 'проблема', 'неудача', 'провал', 'жалоба',
            'претензия', 'недовольн', 'расстроен', 'разочарован', 'обман',
            'плохой', 'худший', 'ужасный', 'неприятн', '👎', '😠', '😡', '💔'
        ]
        
        positive_count = sum(1 for word in positive_words if word in text)
        negative_count = sum(1 for word in negative_words if word in text)
        
        exclamations = len(re.findall(r'!+', text))
        questions = len(re.findall(r'\?+', text))
        
        if exclamations > 2:
            positive_count += 1
        
        total_markers = positive_count + negative_count
        
        if total_markers == 0:
            sentiment = 'neutral'
            confidence = 0.5
        elif positive_count > negative_count:
            sentiment = 'positive'
            confidence = min(0.6 + (positive_count / max(total_markers, 1)) * 0.4, 0.95)
        elif negative_count > positive_count:
            sentiment = 'negative'
            confidence = min(0.6 + (negative_count / max(total_markers, 1)) * 0.4, 0.95)
        else:
            sentiment = 'neutral'
            confidence = 0.55
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'sentiment': sentiment,
                'confidence': confidence
            })
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Ошибка обработки: {str(e)}'})
        }
