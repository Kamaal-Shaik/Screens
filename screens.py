from flask import Flask, request, jsonify
# from crud import call_client
from pymongo import MongoClient
from bson.objectid import ObjectId

app = Flask(__name__)

client = MongoClient('localhost', 27017)
screens_db = client['screens']
tbl = screens_db.hierarchy

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    # response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-access-token')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response



@app.route('/index', methods=['GET'])
def index():
    return jsonify('This is index page')


def obj_to_dict(list_object):
    con_dict = []
    for i in list_object:
        print(i)
        dic = {}
        for k, v in i.items():
            if k == '_id':
                dic['id'] = str(v)
            elif k == 'parent_id':
                dic[k] = str(v)
            else:
                dic[k] = v
        con_dict.append(dic)
    return con_dict

@app.route('/get_states', methods=['GET'])
def find_states():
    try:
        states_res = tbl.find({'parent_id': 0})
        return jsonify({'status': 'success', 'info': obj_to_dict(states_res)})
    except Exception as e:
        return jsonify({'status': 'failed', 'info': str(e)})

@app.route('/get_remaining/<parent_id>', methods=['GET'])
def find_remaining(parent_id):
    try:
        p_id = 0 if str(parent_id) == "0" else ObjectId(parent_id)
        states_res = tbl.find({'parent_id': p_id})
        return jsonify({'status': 'success', 'info': obj_to_dict(states_res)})
    except Exception as e:
        return jsonify({'status': 'failed', 'info': str(e)})


@app.route('/add_state', methods=['POST'])
def create_state():
    if request.json:
        try:
            data = request.get_json()
            if data['name']:
                insert_res = tbl.insert({'name': data['name'], 'parent_id': 0})
                return jsonify(str(insert_res))
        except Exception as e:
            return jsonify(str(e))
    else:
        return jsonify('Please provide mandatory fields.')

@app.route('/add_remaining', methods=['POST'])
def create_remaining():
    if request.json:
        try:
            data = request.get_json()
            if data['name'] and data['parent_id']:
                p_id = 0 if str(data['parent_id']) == "0" else ObjectId(data['parent_id'])
                insert_res = tbl.insert({'name': data['name'],  'parent_id': p_id})
                return jsonify({'status': 'success', 'info': str(insert_res)})
        except Exception as e:
            return jsonify({'status': 'failed', 'info': str(e)})
    else:
        return jsonify({'status': 'failed', 'info': 'Please provide mandatory fields.'})


@app.route('/update_state', methods=['PUT'])
def modify_state():
    if request.json:
        try:
            data = request.get_json()
            if data['id'] and data['name']:
                insert_res = tbl.update({'_id': ObjectId(data['id'])},
                                        {'$set': {'name': data['name']}})
                return jsonify(str(insert_res))
        except Exception as e:
            return jsonify(str(e))
    else:
        return jsonify('Please provide mandatory fields.')

@app.route('/update_remaining', methods=['PUT'])
def modify_remaining():
    if request.json:
        try:
            data = request.get_json()
            if data['id'] and data['name'] and data['parent_id']:
                p_id = 0 if str(data['parent_id']) == "0" else ObjectId(data['parent_id'])
                insert_res = tbl.update({'_id': ObjectId(data['id'])},
                                        {'$set': {'name': data['name'],
                                                  'parent_id': p_id}})
                return jsonify({'status': 'success', 'info': str(insert_res)})
        except Exception as e:
            return jsonify({'status': 'failed', 'info': str(e)})
    else:
        return jsonify({'status': 'failed', 'info': 'Please provide mandatory fields.'})


@app.route('/delete_by_id', methods=['DELETE'])
def remove_record():
    if request.json:
        try:
            data = request.get_json()
            if data['id']:
                insert_res = tbl.delete_one({'_id': ObjectId(data['id'])})
                return jsonify({'status': 'success', 'info': str(insert_res)})
        except Exception as e:
            return jsonify({'status': 'failed', 'info': str(e)})
    else:
        return jsonify({'status': 'failed', 'info': 'Please provide mandatory fields.'})


if __name__ == '__main__':
    app.run(debug=True)