module.exports = function (grunt) {

    var fs = require('fs');

    //!!!! 只需要改这里就可以了 !!!!!!! webapps下面的工程目录名称, 斜杠  / 不能省略.
    // 如果只想放在根目录下, 空字符串即可.
    var projectPath = "/webui";

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        webapp: {
            'path': __dirname,
            'dist': 'dist' + projectPath,
            'project_path': projectPath,
            'htmlbuild': projectPath + '/x'
        },
        baseUrl: '',
        /* 清除文件或清空文件夹 https://github.com/gruntjs/grunt-contrib-clean */   
        clean: {
            build: {
                src: ['<%= webapp.path %>/dist/**']
            },
            svg: {
                src: [
                    '<%= webapp.path %>/<%= webapp.dist %>/svg/**/*.svg',
                    '!<%= webapp.path %>/<%= webapp.dist %>/svg/all-icons.svg'
                ]
            },
            component_css: {
                src: [
                    '<%= webapp.path %>/<%= webapp.dist %>/component/**/*.css',
                    '<%= webapp.path %>/<%= webapp.dist %>/style/**/*.css',
                    '!<%= webapp.path %>/<%= webapp.dist %>/style/app.css'
                ]
            },
            lib_js: {
                src: [
                    '<%= webapp.path %>/<%= webapp.dist %>/lib/**.js',
                    '!<%= webapp.path %>/<%= webapp.dist %>/lib/lib.js'
                ]
            },
            sea_config_js: {
                src: [
                    '<%= webapp.path %>/<%= webapp.dist %>/sea.config.js'
                ]
            },
            backinterface: {
                src: [
                    '<%= webapp.path %>/<%= webapp.dist %>/backinterface/'
                ]
            }
        },
        /* 复制文件和文件夹 https://github.com/gruntjs/grunt-contrib-copy */
        copy: {
            build: {
                expand: true,
                cwd: '<%= webapp.path %>/src',
                src: ['**'],
                dest: '<%= webapp.path %>/<%= webapp.dist %>/'
            }
        },
        /* 合并文件 https://github.com/gruntjs/grunt-contrib-concat */
        concat: {
            component_css: {
                files: [{
                    src: [
                        '<%= webapp.path %>/<%= webapp.dist %>/style/bootstrap.css',
                        '<%= webapp.path %>/<%= webapp.dist %>/style/main.css',
                        '<%= webapp.path %>/<%= webapp.dist %>/component/**/*.css',
                    ],
                    dest: '<%= webapp.path %>/<%= webapp.dist %>/style/app.css'
                }]
            },
            lib_js: {
                files: [{
                    src: [
                        '<%= webapp.path %>/<%= webapp.dist %>/lib/jquery.js',
                        '<%= webapp.path %>/<%= webapp.dist %>/lib/*.js',
                    ],
                    dest: '<%= webapp.path %>/<%= webapp.dist %>/lib/lib.js'
                }]
            }
        },
        /* 压缩css文件 https://github.com/gruntjs/grunt-contrib-cssmin */
        cssmin: {
            build: {
                options: {
                    shorthandCompacting: false,
                    roundingPrecision: -1
                },
                files: [{
                    expand: true,
                    cwd: '<%= webapp.path %>/<%= webapp.dist %>/style',
                    src: ['*.css', '!*.min.css'],
                    dest: '<%= webapp.path %>/<%= webapp.dist %>/style'
                }]
            }
        },
        /* 压缩html https://github.com/gruntjs/grunt-contrib-htmlmin */
        htmlmin: {
            options: {
                removeComments: true,
                collapseWhitespace: true
            },
            index_html: {
                files: {
                    '<%= webapp.path %>/<%= webapp.dist %>/index.html': '<%= webapp.path %>/<%= webapp.dist %>/index.html'
                }
            }
        },
        /* 给js和css加上MD5后缀, 利用浏览器缓存进行优化 https://github.com/yeoman/grunt-filerev */
        filerev: {
            md5_js_css: {
                src: [
                    '<%= webapp.path %>/<%= webapp.dist %>/**/*.css',
                    '<%= webapp.path %>/<%= webapp.dist %>/**/*.js',
                    '<%= webapp.path %>/<%= webapp.dist %>/sea.config.js',
                    '!<%= webapp.path %>/<%= webapp.dist %>/geojson/**/*.json'  // 地图资源，不加md5戳
                ]
            },
        },
        /* filerev辅助工具, 更换页面中对脚本和样式文件的引用为加上md5后缀后的引用, https://github.com/solidusjs/grunt-filerev-replace */
        filerev_replace: {
            md5_js_css: {
                options: {
                    assets_root: '<%= webapp.path %>/<%= webapp.dist %>/',  //匹配的路径前缀
                    views_root: '<%= webapp.path %>/<%= webapp.dist %>/'    //相对路径转换成绝对路径来进行匹配
                },
                src: [
                    '<%= webapp.path %>/<%= webapp.dist %>/**/*.html'
                ]
            }
        },
        /* 压缩JS https://github.com/gruntjs/grunt-contrib-uglify */
        uglify: {
            build_lib: {
                files: [{
                    expand: true,
                    cwd: '<%= webapp.path %>/<%= webapp.dist %>/lib',
                    src: ['*.js', '!*.min.js'],
                    dest: '<%= webapp.path %>/<%= webapp.dist %>/lib'
                }]
            },
            build_component: {
                files: [{
                    expand: true,
                    cwd: '<%= webapp.path %>/<%= webapp.dist %>/component',
                    src: ['**/*.js', '!*.min.js'],
                    dest: '<%= webapp.path %>/<%= webapp.dist %>/component'
                }]
            },
        },
        /* 合并svg https://github.com/FWeinb/grunt-svgstore */
        svgstore: {
            options: {
                includedemo: true
            },
            build: {
                src: [
                    '<%= webapp.path %>/src/component/**/*.svg',
                    '<%= webapp.path %>/src/svg/**/*.svg',
                    '!<%= webapp.path %>/src/svg/all-icons.svg'
                ],
                dest: '<%= webapp.path %>/src/svg/all-icons.svg'
            }
        },
        /* 使用字符串、正则或函数替换文本文件中文本 https://www.npmjs.com/package/grunt-text-replace */
        replace: {
            options: {
                //customSrc: '<%= webapp.path %>/server/conf/deploy.js',
                //customReplace: /^module\.exports.*$/img
            },
            lib_js: {
                src:  [
                    '<%= webapp.path %>/<%= webapp.dist %>/*.html'
                ],
                overwrite: true,
                replacements: [{
                    from: '<!-- lib.js placeholder -->',
                    to: '<!-- build:script lib --><!-- /build -->'
                }]
            },
            sea_config_js: {
                src:  [
                    '<%= webapp.path %>/<%= webapp.dist %>/*.html'
                ],
                overwrite: true,
                replacements: [{
                    from: '/* sea.config.js placeholder */',
                    to: '<!-- build:section sea_config_js --><!-- /build -->'
                }]
            },
            img_path: {
                src: [
                    '<%= webapp.path %>/<%= webapp.dist %>/**/*.html'
                ],
                overwrite: true,
                replacements:[{ // 正则替换, img标签的src /img/xx/x.png' 变成 /目录/img/xx/x.png
                    from: /(<img.*)(src\s*=\s*)(\'|\")(\/img.*)(\'|\".*>)/img,      
                    to: '$1$2$3<%= webapp.project_path %>$4$5'
                }]
            },
            base_url: {
                src: [
                    '<%= webapp.path %>/<%= webapp.dist %>/index.html'
                ],
                overwrite: true,
                replacements:[{ // 正则替换, img标签的src /img/xx/x.png' 变成 /目录/img/xx/x.png
                    from: "baseUrl: '', //grunt replace:base_url",
                    to: "baseUrl: '<%= webapp.project_path %>', //"
                }]
            }
        },
        /* 在页面中动态添加脚本和样式文件 https://github.com/spatools/grunt-html-build */
        htmlbuild: {
            css_svg: {
                options: {
                    beautify: true,
                    relative: true,
                    prefix: '<%= webapp.htmlbuild %>',
                    styles: {
                        bundle: [
                            '<%= webapp.path %>/<%= webapp.dist %>/style/*.css',
                            '<%= webapp.path %>/<%= webapp.dist %>/component/**/*.css'
                        ]
                    },
                    sections: {
                        views: '<%= webapp.path %>/<%= webapp.dist %>/svg/all-icons.svg'
                    }
                },
                src: [
                    '<%= webapp.path %>/<%= webapp.dist %>/*.html'
                ],
                dest: '<%= webapp.path %>/<%= webapp.dist %>/'
            },
            lib_js: {
                options: {
                    beautify: true,
                    relative: true,
                    prefix: '<%= webapp.htmlbuild %>',
                    scripts: {
                        lib: [
                            '<%= webapp.path %>/<%= webapp.dist %>/lib/jquery.js',
                            '<%= webapp.path %>/<%= webapp.dist %>/lib/**/*.js'
                        ]
                    }
                },
                src: [
                    '<%= webapp.path %>/<%= webapp.dist %>/*.html'
                ],
                dest: '<%= webapp.path %>/<%= webapp.dist %>/'
            },
            sea_config_js: {
                options: {
                    beautify: true,
                    relative: true,
                    prefix: '<%= webapp.htmlbuild %>',
                    sections: {
                        sea_config_js: '<%= webapp.path %>/<%= webapp.dist %>/sea.config.js'
                    }
                },
                src: [
                    '<%= webapp.path %>/<%= webapp.dist %>/*.html'
                ],
                dest: '<%= webapp.path %>/<%= webapp.dist %>/'
            }
        },
        /* 通过connect任务，创建一个静态服务器 https://www.npmjs.com/package/grunt-contrib-connect */
        connect: {
          options: {
            port: 3000,
            hostname: 'localhost',
            base: '<%= webapp.path %>/dist/'
          },
          livereload: {
            options: {
              middleware: function(connect, options) {
                return [
                  // 把脚本，注入到静态文件中, 通过LiveReload脚本，让页面重新加载.
                  require('connect-livereload')({ port: 35729 }),
                  // 静态文件服务器的路径
                  require('serve-static')(options.base[0]),
                  // 启用目录浏览(相当于IIS中的目录浏览)
                  require('serve-index')(options.base[0])
                ];
              }
            }
          }
        },
        /* 实时监听文件变化 https://github.com/gruntjs/grunt-contrib-watch */
        watch: {
            options: {
                livereload: true
            },
            dev: {
                files: [
                    '<%= webapp.path %>/src/**/*.html',
                    '<%= webapp.path %>/src/**/*.css',
                    '<%= webapp.path %>/src/**/*.js',
                    '<%= webapp.path %>/src/**/*.json',
                    '<%= webapp.path %>/src/**/*.{png,jpg,gif}'
                ],
                tasks: ['dev']
            },
            prod: {
                files: [
                    '<%= webapp.path %>/src/**/*.html',
                    '<%= webapp.path %>/src/**/*.css',
                    '<%= webapp.path %>/src/**/*.js',
                    '<%= webapp.path %>/src/**/*.json',
                    '<%= webapp.path %>/src/**/*.{png,jpg,gif}'
                ],
                tasks: ['prod']
            }
        }
    });

    // 载入插件
    grunt.loadNpmTasks('grunt-contrib-clean');      //https://github.com/gruntjs/grunt-contrib-clean
    grunt.loadNpmTasks('grunt-contrib-copy');       //https://github.com/gruntjs/grunt-contrib-copy
    grunt.loadNpmTasks('grunt-filerev');            //https://github.com/yeoman/grunt-filerev
    grunt.loadNpmTasks('grunt-filerev-replace');    //https://github.com/solidusjs/grunt-filerev-replace
    grunt.loadNpmTasks('grunt-contrib-uglify');     //https://github.com/gruntjs/grunt-contrib-uglify
    grunt.loadNpmTasks('grunt-contrib-concat');     //https://github.com/gruntjs/grunt-contrib-concat
    grunt.loadNpmTasks('grunt-contrib-watch');      //https://github.com/gruntjs/grunt-contrib-watch
    grunt.loadNpmTasks('grunt-contrib-connect');    //https://www.npmjs.com/package/grunt-contrib-connect
    grunt.loadNpmTasks('grunt-contrib-cssmin');     //https://github.com/gruntjs/grunt-contrib-cssmin
    grunt.loadNpmTasks('grunt-contrib-htmlmin');    //https://github.com/gruntjs/grunt-contrib-htmlmin
    grunt.loadNpmTasks('grunt-html-build');         //https://github.com/spatools/grunt-html-build
    grunt.loadNpmTasks('grunt-text-replace');       //https://www.npmjs.com/package/grunt-text-replace
    grunt.loadNpmTasks('grunt-svgstore');           //https://www.npmjs.com/package/grunt-svgstore

    // 默认任务, 控制台执行: grunt 或者 grunt default
    grunt.registerTask('default', ['dev']);

    // 合并svg, 当新增修改svg后执行这个命令, 控制台执行: grunt svg
    grunt.registerTask('svg', ['svgstore']);

    // 开发者工具, 启动静态服务器(node服务器), 自动监听文件变化, 自动刷新网页, 自动部署, (新增文件后需要重启命令)
    grunt.registerTask('wl', ['dev', 'connect', 'watch:dev']);

    // 简易开发者工具, 自动监听文件变化, 自动部署, 方便单独启动其他服务器(nginx,apache)进行开发工作, 指定dist为服务器根目录即可.
    grunt.registerTask('w', ['dev', 'watch:dev']);

    // 线上部署调试工具, 压缩,合并,替换,md5并开启静态服务器
    grunt.registerTask('wl-prod', ['prod', 'connect', 'watch:prod']);
    
    // 开发者模式的项目部署
    grunt.registerTask('dev', '项目develop调试部署', function() {
        grunt.task.run([
            // 清除dist目录, 复制src目录到dist目录
            'clean:build', 'copy:build',
            // 将页面占位符替换为css和svg,
            'svg', 'htmlbuild:css_svg',
            // 将页面占位符替换为js, 替换img图标路径, 替换seajs的模块加载路径
            'replace:lib_js', 'htmlbuild:lib_js', 'replace:img_path', 'replace:base_url'
          //  // 将sea.config.js动态添加到页面中
          //  'replace:sea_config_js', 'htmlbuild:sea_config_js', 'clean:sea_config_js'
        ]);
    });

    // 开发者模式的项目部署    
    grunt.registerTask('prod', '项目product部署', function() {
        grunt.task.run([
            // 清除dist目录, 复制src目录到dist目录, 并清除后台接口数据
            'clean:build', 'copy:build', 'clean:backinterface',
            // css合并, 合并src/component里面的css
            'concat:component_css', 'clean:component_css',
            // css压缩
            'cssmin:build',
            // css替换, 注入合并后的css文件和合并后的svg文件, 替换页面中的占位符
            'svg', 'htmlbuild:css_svg', 'clean:svg',
            // js压缩
            'uglify:build_lib', 'uglify:build_component',
            // js合并, 将src/lib目录下的库文件合并成lib.js
            'concat:lib_js', 'clean:lib_js',
            // js替换, 注入合并后的js文件, 替换页面中的占位符, 替换img图标路径, 替换seajs的模块加载路径
            'replace:lib_js', 'htmlbuild:lib_js', 'replace:img_path', 'replace:base_url',
          //  // 将sea.config.js动态添加到页面中
          //  'replace:sea_config_js', 'htmlbuild:sea_config_js', 'clean:sea_config_js',
            // md5戳, 给js和css加上md5后缀
            'filerev:md5_js_css', 'filerev_replace:md5_js_css',
            // 压缩index.html
            'htmlmin:index_html'
        ]);
    });
};
