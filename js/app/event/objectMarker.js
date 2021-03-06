/**
 * Created by Bonsai on 16-9-24.
 */
define(['../ray', '../camera', '../scene', '../renderer', 'three', '../util/util'],
function(ray, camera, scene, renderer, THREE, U){
    'use strict';

    var mouse = new THREE.Vector2();

    var onMouseDbl = function(event, marker) {
        event.preventDefault();

        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        ray.setFromCamera( mouse, camera );
        for (var idx in marker._markableTypes){
            var groupName = marker._markableTypes[idx];
            if (scene.getObjectByName(groupName).visible){
                var intersects = ray.intersectObjects( scene.getObjectByName(groupName).children);
                if (intersects.length > 0){
                    marker.mark(intersects[0].object);
                    break
                }
            }
        }
    };

    // need keep a reference of mouse dbl handler, Or else, can't remove this listener
    var dirtyFunc = null;

    var markLink = function(obj){
        if (obj.bonsaiType !== 'Link') throw new U.DevelopError('mark a wrong bonsaiType obj');
        obj.material.uniforms.diffuse.value = new THREE.Color(1,0,0);
    };

    var unMarkLink = function(obj){
        if (obj.bonsaiType !== 'Link') throw new U.DevelopError('mark a wrong bonsaiType obj');
        obj.material.uniforms.diffuse.value = new THREE.Color(0,0,0);
    };

    var markName = function(obj){
        if (obj.bonsaiType !== 'Name') throw new U.DevelopError('mark a wrong bonsaiType obj');
        obj.material.color = new THREE.Color(1,0,0);
    };

    var markBuild = function(obj){
        if (obj.bonsaiType !== 'Build') throw new U.DevelopError('mark a wrong bonsaiType obj');
        obj.material.color = new THREE.Color(1,0,0);
    };

    var ObjectMarker = function(isMultiMarker, markableTypes){
        this._activeObjectsNo = [];
        this._markableTypes = markableTypes || ['Links', 'Nodes', 'Builds', 'Names'];
        this._isMultitMarker = U.defined(isMultiMarker) ? isMultiMarker : false;
        this._listeners = {};

        this.activate();
    };


    Object.assign(ObjectMarker.prototype, {
        construct: ObjectMarker,

        bind : function(event, handler){
            var self = this;

            if( !self._listeners[event]) self._listeners[event] = [];
            self._listeners[event].push(handler);
            return self
        },

        unbind : function(event, handler){
            var self = this;

            if (!U.defined(self._listeners[event])) return self;

            if (!U.defined(handler)) {
                self._listeners[event] = null;
                return self
            }

            if (self._listeners[event].indexOf(handler) > -1){
                self._listeners[event].splice(handler, 1);
            }
            return self
        },

        notify : function(event, data, member) {
            var self = this;

            var l = self._listeners[ event ];
            if ( ! l ) return;

            if ( ! member ) {
                for ( var i = 0; i < l.length; i ++ ) {
                    l[ i ]( data );
                }

            }
        },
        
        activate: function(){
            var self = this;

            dirtyFunc = function(event){onMouseDbl.call(this, event, self)};
            renderer.domElement.addEventListener('dblclick', dirtyFunc , false);
        },
        
        deactivate: function(){
            renderer.domElement.removeEventListener('dblclick', dirtyFunc, false);
        },

        addMakableType: function(typeName){
            if (this.makableType.indexOf(typeName) == -1) {
                this.makableType.push(typeName);
            }
        },

        removeMakableType: function(typeName){
            if (this.makableType.indexOf(typeName) != -1){
                this.makableType.remove(typeName);
            }
        },

        toggleMultiMarker: function(){
            this._isMultitMarker = !this._isMultitMarker;
        },

        mark: function(obj){
            var self = this;
            if(self._isMultitMarker){
                self._activeObjectsNo.push(obj.id)
            }else{
                self._activeObjectsNo = [obj.id]
            }

            switch (obj.bonsaiType){
                case 'Link':
                    self.notify('markLink', obj);
                    markLink(obj);
                    break;
                case 'Build':
                    self.notify('markBuild', obj);
                    markBuild(obj);
                    break;
                case 'Name':
                    self.notify('markName', obj);
                    markName(obj);
                    break;
                case 'Node':
                    self.notify('markNode', obj);
                    break;
                default:
                    // throw new U.DevelopError('why you can choose an unknown type object');
            }

        }


    });
    
    return new ObjectMarker();
});